## Vue3 解析系列之数据响应式

> 前言:本文是基于 Vue 3.0.5 进行解析,主要用于个人学习梳理流程.也是第一次正儿八经的写文章.如果不对请指正.

**前言**

在上一期 Vue3 解析系列中我们对 **`mount` 挂载逻辑** 进行了解析,知道了其实在组件挂载的最后一步 `setupRenderEffect函数` 中会通过`effect函数`收集**副作用(componentEffect)** 并执行.通过执行副作对当前实例进行 **render 渲染**,并生成最终的页面.那么`Vue`是如何通过修改数据对页面进行更新的呢? 接下来就让我们进入 **数据响应式** 的逻辑解析吧.

话不多说上源码

#### createReactiveEffect

首先还是要请出上一篇解析中出现过的 **createReactiveEffect 函数**.其中需要注意的 **activeEffect** ,它的主要用处就是标记当前需要被收集的副作用,便于在依赖收集时关联对应的依赖对象

```javascript
// packages/reactivity/src/effect.ts
// TODO 生成effect
function createReactiveEffect<T = any>(
  fn: () => T,  // 传入的副作用函数
  options: ReactiveEffectOptions // 配置项
): ReactiveEffect<T> {
  const effect = function reactiveEffect(): unknown {
    // 如果 effect 不是激活状态，这种情况发生在我们调用了 effect 中的 stop 方法之后，那么先前没有传入调用 scheduler 函数的话，直接调用原始方法fn，否则直接返回。
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    //那么处于激活状态的 effect 要怎么进行处理呢？首先判断是否当前 effect 是否在 effectStack 当中，如果在，则不进行调用，这个主要是为了避免重复调用.
    if (!effectStack.includes(effect)) {
      // 清除副作用
      cleanup(effect)
      try {
        //启用追踪 其实就是把一个追踪状态存入到 trackStack 队列中 和下面的 effectStack 一一对应 就能区分开哪个 effect 需要被追踪
        enableTracking()
        // 把当前 effect 放入 effectStack 中
        effectStack.push(effect)
        // 然后讲 activeEffect 设置为当前的 effect
        activeEffect = effect
        // fn 并且返回值
        return fn()
      } finally {
        // 当这一切完成的时候，finally 阶段，会把当前 effect 弹出，恢复原来的收集依赖的状态，还有恢复原来的 activeEffect。
        effectStack.pop()
        // 重置追踪
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect

  effect.id = uid++ //自增 id 唯一 effect
  effect.allowRecurse = !!options.allowRecurse
  effect._isEffect = true //用于标识方法是否是effect
  effect.active = true //是否被激活
  effect.raw = fn // 传入的回调方法
  effect.deps = [] // 持有当前 effect 的dep 数组
  effect.options = options // 创建effect是传入的options
  return effect
}
```

接下来让我们看看怎么进行依赖收集及触发到**对应的 effect(副作用)**

### 数据响应模块 reactivity

#### reactive

```javascript
// packages/reactivity/src/reactive.ts
export function reactive(target: object) {
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    // 对象是不是 __v_isReadonly 只读 是只读直接返回 target 不进行劫持
    return target
  }
  // 实际的操作在 createReactiveObject
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
```

**总结**
判断当前对象是否是`IS_READONLY`(只读),是的话直接返回.不是的话进行代理逻辑.

#### createReactiveObject

```javascript
// 省略部分 DEV 环境代码
// packages/reactivity/src/reactive.ts
// TODO 创建代理对象
function createReactiveObject(
  target: Target, // 需要被代理的对象
  isReadonly: boolean, //只读属性  表示要创建的代理是不是只可读的，
  baseHandlers: ProxyHandler<any>,  // 是对进行基本类型的劫持，即[Object, Array]
  collectionHandlers: ProxyHandler<any> //  是对集合类型的劫持, 即[Set, Map, WeakMap, WeakSet]。
) {
  if (!isObject(target)) {
    // 如果不是对象则直接返回 target
    return target
  }
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    // 如果目标已经代理了则直接返回
    return target
  }
  // 我们创建的 proxy 有两种类型，一种是响应式的，另外一种是只读的
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  // 如果传入的目标已经存在了则直接返回
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const targetType = getTargetType(target)
  // 判断目标类型 如果类型是失效的就直接返回对象
  if (targetType === TargetType.INVALID) {
    return target
  }
  // TODO 最终进行代理
  // weakMap weakSet Set Map   // Object Array // 根据状态来判断最终调用的方法
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  // 插入代理 Map 表 target => proxy
  proxyMap.set(target, proxy)
  return proxy
}
```
**总结**
对需要被代理的对象进行了判断,查看是否符合代理的条件.最终判断类型选择代理类型.接下来我们来分析下对应的代理类型


#### mutableHandlers
 `mutableHandlers` 就是上文的 `baseHandlers` 代理类型
主要需要关注的是 `get()` 和 `set()`,因为是通过他们实现依赖收集

`````javascript
// packages/reactivity/src/baseHandlers.ts
/**
 * handler.get() 方法用于拦截对象的读取属性操作。
 * handler.set() 方法是设置属性值操作的捕获器。
 * handler.deleteProperty() 方法用于拦截对对象属性的 delete 操作。
 * handler.has() 方法是针对 in 操作符的代理方法。
 * handler.ownKeys() 方法用于拦截
 *    Object.getOwnPropertyNames()
 *    Object.getOwnPropertySymbols()
 *    Object.keys()
 *    for…in循环
 */

// TODO 代理监听状态
// 正常监听状态
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}

// 在源码内 get 有四种状态
const get = /*#__PURE__*/ createGetter() // 正常的 get
const shallowGet = /*#__PURE__*/ createGetter(false, true) // 浅层的 get
const readonlyGet = /*#__PURE__*/ createGetter(true) // 只读的 get
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true) // 浅层只读的 get


// 主要是通过 isReadonly  shallow 和 目标类型 target 进行数据返回和数据是否代理
// get 的工厂函数
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // 首先如果 key 是 代理过的属性 返回对应的状态 !isReadonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      // 首先如果 key 是 只读属性 返回对应的状态 isReadonly
      return isReadonly
    } else if (
      key === ReactiveFlags.RAW &&
      receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)
    ) {
      return target
    }
    // 目标是否是数组
    const targetIsArray = isArray(target)
    // 不是只读 并且 是数组 并且 是 'includes', 'indexOf', 'lastIndexOf' 三个属性
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      // 如果target对象中指定了getter，receiver则为getter调用时的this值。 receiver => Proxy代理对象
      return Reflect.get(arrayInstrumentations, key, receiver)
    }

    const res = Reflect.get(target, key, receiver)
    // 如果 key 是 Symbol ,则直接返回 res 值。
    if (
      isSymbol(key)
        ? builtInSymbols.has(key as symbol)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }
    //TODO 核心  而如果是 isReadonly 不是只读，则进行依赖收集
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
    // 如果是浅层 get 直接返回数据 不进行监听
    if (shallow) {
      return res
    }
    // 判断是否是 Ref
    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }
    // 如果是对象
    if (isObject(res)) {
      // 不是只读继续代理     创建只读代理      继续创建代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

// 在源码内 set 有两种状态
const set = /*#__PURE__*/ createSetter()  // 正常的 set
const shallowSet = /*#__PURE__*/ createSetter(true) // 浅层的 set

// set 的工厂函数


`````

