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

-----

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
  baseHandlers: ProxyHandler<any>, // 是对进行基本类型的劫持，即[Object, Array]
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

```javascript
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
    //TODO 不是只读,则进行依赖收集
    if (!isReadonly) {
      // TODO 核心 track 依赖收集
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

// TODO set 工厂函数
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    // 获取需要更改的值
    const oldValue = (target as any)[key]
    // 不是在 shallow(浅层) 模式下
    if (!shallow) {
        // toRaw 是一个简单的迭代函数，直到传入的对象不存在 ReactiveFlags.RAW 为止，就获取到了想要的原始数据( 未代理前 )
      value = toRaw(value)
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    }
    // 如果目标是数组则返回 长度比较
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    if (target === toRaw(receiver)) {
      // TODO 核心 触发依赖更新 trigger
      if (!hadKey) {
        // 字段改变 是新增
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        // 长度改变 更新
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}


```

**总结**

这块和 **Vue2** 的实现逻辑差不多.比较大的改动就是 **Vue2** 是通过 `Object.defineProperty` 劫持了对象的属性.在 `set` 和 `get` 内进行依赖收集和触发.还有点值得注意的是 `Object.defineProperty` 只能劫持对象属性.对于数组来说是没有办法进行劫持的.所以在 **Vue2** 内.重写了 7 个可修改数组的方法`push`,`pop`,`shift`,`unshift`,`splice`,`sort`,`reverse`.在执行过程中会进行依赖收集和依赖触发.

**Vue3** 舍弃了 **Vue2** 对于属性的劫持方式.修改为通过 Proxy 代理了整个对象.

- Proxy 优点

  - 可以直接监听整个对象而非属性.
  - 可以直接监听数组的变化.
  - 有 13 中拦截方法，如`ownKeys`、`deleteProperty`、`has` 等是 `Object.defineProperty` 不具备的.
  - 返回的是一个新对象，我们可以只操作新的对象达到目的,而 Object.defineProperty 只能遍历对象属性直接修改.
  - 做为新标准将受到浏览器产商重点持续的性能优化,也就是传说中的新标准的性能红利.

- Proxy 缺点

  - 浏览器兼容性问题,而且无法用 polyfill 磨平.

- Object.defineProperty 优势

  - 兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题,而且无法用 polyfill 磨平.

- Object.defineProperty 缺点
  - 只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历.
  - 不能监听数组.是通过重写数据的那 7 个可以改变数据的方法来对数组进行监听的.
  - 也不能对 es6 新产生的 `Map` , `Set` 这些数据结构做出监听.
  - 也不能监听新增和删除操作,通过 `Vue.set()` 和 `Vue.delete` 来实现响应式的.

#### track

依赖收集和建立依赖关系映射表阶段
````javascript
// packages/reactivity/src/effect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // 接收 3 个参数 target 代理对象 type 跟踪的类型  key 触发的代理对象的 key
  // 判断 当前没有暂停追踪 没有活动副作用
  // 还记得 activeEffect 这个变量吗.其实就是在 创建副作用(createReactiveEffect)时赋值的 effect
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  // targetMap ===> weakMap 弱引用 看看当前代理对象是否已经被代理
  let depsMap = targetMap.get(target)
  // 没有被代理则存入 weakMap 对象内 避免重复代理
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // depsMap===> Map 对象
  let dep = depsMap.get(key)
  // 检测当前目标上的属性 是否被代理 避免重复代理
  if (!dep) {
    // dep 是个 Set 集合 表明 dep 内唯一值
    depsMap.set(key, (dep = new Set()))
  }
  //如果对象对应的 key 的 依赖 set 集合也没有当前 activeEffect， 则把 activeEffect 加到 set 里面，同时把 当前 set 塞到 activeEffect 的 deps 数组
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    // 所以 deps 就是 effect 中所依赖的 key 对应的 set 集合数组
    activeEffect.deps.push(dep)
  }
}
````

#### trigger

````javascript
export function trigger(
  target: object, // 触发的对象
  type: TriggerOpTypes, // type 触发的类型
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  // 如果 depsMap 为空说明依赖没有被追踪
  if (!depsMap) {
    return
  }
  // 副作用映射表
  const effects = new Set<ReactiveEffect>()

  // 主要的作用就是在 effects 映射表中加入每个修改 key 的副作用.形成一个执行栈.因为是 Set 类型.唯一值
  // TODO 所以如果是在同一组件下多个属性进行修改.因为 Set 类型的关系 实际会进行去重留下最后一次的 effect 的执行.巧妙的解决了多次 effect 触发,进行重复渲染
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || effect.allowRecurse) {
          effects.add(effect)
        }
      })
    }
  }

  // 如果是 clear 类型，则触发这个对象所有的 effect。
  if (type === TriggerOpTypes.CLEAR) {
    // depsMap 储存的是当前 target 的所有属性及属性对应副作用 => key:effect
    // 传入到 add 方法内
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    // 如果 key 是 length, 而且 target 是数组，则会触发 key 为 length 的 effects ，以及 key 大于等于新 length的 effects， 因为这些此时数组长度变化了。
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    // 获取 key 对应的 副作用
    if (key !== void 0) {
      add(depsMap.get(key))
    }
    // 新增 修改 删除
    switch (type) {
      case TriggerOpTypes.ADD:
        // 添加
        if (!isArray(target)) {
          // 不是数组
          // packages/reactivity/src/collectionHandlers.ts
          // TODO 重写了几种拦截跟长度有关的方法 size createForEach createIterableMethod
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            // packages/reactivity/src/collectionHandlers.ts
            // TODO createIterableMethod
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // 是数组key是整数.修改长度时
          add(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        // 删除
        // 都是在 DEV 环境下的
        if (!isArray(target)) {
          add(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            add(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        // 设置
        if (isMap(target)) {
          add(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  const run = (effect: ReactiveEffect) => {
    // effect.options.scheduler，如果传入了调度函数，则通过 scheduler 函数去运行 effect，
    // 但是 scheduler 里面可能不一定使用了 effect，例如 computed 里面，因为 computed 是延迟运行 effect,详细看 computed 内部实现
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }
  // 最后运行 effects.forEach(run) => effects.forEach(effect => run(effect))
  // 执行所有的副作用
  effects.forEach(run)
}

````
**总结**

 `track` 和`trigger`的作用就是进行依赖关系的建立(`track`),便于属性修改时`(trigger)` 执行映射表内对应的 **副作用函数`effect`**, 进而触发 **`VNode` 的 `Patch`** 方法.进行对DOM的更新,最终更新页面.

### 流程图

补充下之前一直说的流程图.


![vue3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37f227c548464572bae09ec23767a60b~tplv-k3u1fbpfcp-watermark.image)

### 结语
Vue3 整个 **组件初始化(mount)** 过程已经讲完了.后续会对 **组件更新(update)** 过程进行补充.


-------

往期文章:

[Vue3 解析系列之createAppAPI函数](https://juejin.cn/post/7000186937805897742)

[Vue3 解析系列之 mount 函数](https://juejin.cn/post/7000613932553486343)
