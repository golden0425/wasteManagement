## Vue3 解析系列之 mount 函数

> 前言:本文是基于 Vue 3.0.5 进行解析,主要用于个人学习梳理流程.也是第一次正儿八经的写文章.如果不对请指正.

**前言**

在上一期 Vue3 解析系列中我们对 **`createAppAPI函数`** 进行了解析,但是并没有对核心方法 **`mount` 挂载逻辑** 进行解析.本期会从 **`创建VNode` 和 `组件初始化挂载`** 阶段进行解析.

话不多说上源码:

先进入到 `mount` 函数内部.发现了里面有 2 个关键函数 `createVNode`,`render`,这两个函数也可以说是 Vue 的核心逻辑.具体是做什么的继续往下看.

```javascript
  // packages/runtime-core/src/apiCreateApp.ts
   mount(rootContainer: HostElement, isHydrate?: boolean): any {
    // 判断下 isMounted 挂载状态
    if (!isMounted) {
      //TODO 挂载时  获取整棵树 的 vnode
      // createApp(base).mount('#app')
      // 虚拟 DOM 创建方法
      const vnode = createVNode(
        rootComponent as ConcreteComponent,
        rootProps
      )

      // 将初始化上下存储在 根节点的 appContext 属性上
      vnode.appContext = context

      if (isHydrate && hydrate) {
        hydrate(vnode as VNode<Node, Element>, rootContainer as any)
      } else {
        // TODO 渲染器传入的vnode 生成 node 挂载到根节点
        render(vnode, rootContainer)
      }
      // 修改标记已挂载
      isMounted = true
      // 绑定根节点元素
      app._container = rootContainer
      // for devtools and telemetry
      ;(rootContainer as any).__vue_app__ = app
      // 返回 Vue 的实例
      return vnode.component!.proxy
    }
  },
```

---

#### 创建VNode阶段

**createVNode**

看函数名也能知道这个函数是拿来创建 `VNode` 的.经常在面试的时候会被面试官问到什么是 `VNode` 呢,有什么作用呢,为什么需要 VNode? 不瞒大家说我也是被吊打的哪一位.

- VNode 是 JavaScript 对象,也可以理解成节点描述对象,他描述了应该怎样去创建真实的 DOM 节点.

- VNode 的作用:通过 render 将 template 模版描述成 VNode，然后进行一系列操作之后形成真实的 DOM 进行挂载。

- VNode 的优点
  - 兼容性强，不受执行环境的影响。VNode 因为是 JS 对象，不管 Node 还是浏览器，都可以统一操作，从而获得了服务端渲染、原生渲染、手写渲染函数等能力。
  - 减少操作 DOM，任何页面的变化，都只使用 VNode 进行操作对比，只需要在最后一步挂载更新 DOM，不需要频繁操作 DOM，从而提高页面性能。

下面来看看源码

```javascript
// 省略部分 DEV 环境代码
// packages/runtime-core/src/vnode.ts
export const createVNode = _createVNode

// TODO 返回创建完成后的vnode节点
function _createVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT, // 通过 createApp 传入的根组件
  props: (Data & VNodeProps) | null = null, // 通过 createApp第二个参数 传入的根组件道具
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
): VNode {
  //TODO 判断 type 类型 如果没有传入根组件 type = undefined
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment
  }
  //TODO 如果是 VNode 的类型 进行 cloned 并且合并 ref 属性

  // #2078 in the case of <component :is="vnode" ref="extra"/>
  // if the vnode itself already has a ref, cloneVNode will need to merge
  // the refs so the single vnode can be set on multiple refs
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true /* mergeRef: true */)
    // TODO 处理子节点
    if (children) {
      normalizeChildren(cloned, children)
    }
    return cloned
  }
  //TODO  判断类组件
  if (isClassComponent(type)) {
    // class component normalization.
    type = type.__vccOpts
  }
  // TODO 判断是否有配置项
  if (props) {
    // class & style normalization.
    if (isProxy(props) || InternalObjectKey in props) {
      props = extend({}, props)
    }
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      // TODO 处理 class
      props.class = normalizeClass(klass)
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style)
      }
      props.style = normalizeStyle(style)
    }
  }

  // TODO 核心: 判断 vnode 是什么类型 用于后期的节点的渲染
  const shapeFlag = isString(type) // 判断是否是字符串,是字符串就是真实节点
    ? ShapeFlags.ELEMENT
    : __FEATURE_SUSPENSE__ && isSuspense(type) // 判断是否是 Suspense组件( Vue3 新增 )
    ? ShapeFlags.SUSPENSE
    : isTeleport(type)
    ? ShapeFlags.TELEPORT // 判断是否是 TELEPORT组件( Vue3 新增 ) 传送门
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT //判断是否是状态组件
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT //判断是否是函数组件
    : 0
  // 按位与 参与运算的两数各对应的二进位相与。只有对应的两个二进位都为1时，结果位才为1。参与运算的两个数均以补码出现

  const vnode: VNode = {
    __v_isVNode: true,
    [ReactiveFlags.SKIP]: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    children: null,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
  }

  // TODO 核心: 设置根据类型shapeFlag children
  // 通过按位或 把子节点的类型 赋予 到父节点的类型type 上
  // 详细的解析看后续源码
  normalizeChildren(vnode, children)

  // normalize suspense children
  // SUSPENSE组件逻辑
  if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
    const { content, fallback } = normalizeSuspenseChildren(vnode)
    vnode.ssContent = content
    vnode.ssFallback = fallback
  }

  // 后续回来补坑
  if (
    shouldTrack > 0 &&
    !isBlockNode &&
    currentBlock &&
    (patchFlag > 0 || shapeFlag & ShapeFlags.COMPONENT) &&
    patchFlag !== PatchFlags.HYDRATE_EVENTS
  ) {
    currentBlock.push(vnode)
  }
  // 最终返回创建的 vnode 节点
  return vnode
}
```

**normalizeChildren**

在创建 VNode 节点的过程中会通过 **按位或** 把子节点的类型赋予到父节点的类型 type 上.便于后续渲染时对子节点的操作

```javascript
// packages/runtime-core/src/vnode.ts
normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    // 数组
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    // TODO teleport
    /**
     *  对象  vue3 新特性 Teleport
     * teleport 组件必须有一个 to 属性，传递的是一个 css 选择器，相当于传送门的目的地
     *  disabled 属性 生效
     */
    if (shapeFlag & ShapeFlags.ELEMENT || shapeFlag & ShapeFlags.TELEPORT) {
      // Normalize slot to plain children for plain element and Teleport
      const slot = (children as any).default
      // 存在
      if (slot) {
        // _c marker is added by withCtx() indicating this is a compiled slot
        // 标记当前渲染插槽的数量
        slot._c && setCompiledSlotRendering(1)
        normalizeChildren(vnode, slot())
        // 渲染完毕后减去当前渲染的插槽数量
        slot._c && setCompiledSlotRendering(-1)
      }
      return
    } else {
      // 插槽逻辑( 后续补足 )
      type = ShapeFlags.SLOTS_CHILDREN
      const slotFlag = (children as RawSlots)._
      if (!slotFlag && !(InternalObjectKey in children!)) {
        ;(children as RawSlots)._ctx = currentRenderingInstance
      } else if (slotFlag === SlotFlags.FORWARDED && currentRenderingInstance) {
        if (
          currentRenderingInstance.vnode.patchFlag & PatchFlags.DYNAMIC_SLOTS
        ) {
          ;(children as RawSlots)._ = SlotFlags.DYNAMIC
          vnode.patchFlag |= PatchFlags.DYNAMIC_SLOTS
        } else {
          ;(children as RawSlots)._ = SlotFlags.STABLE
        }
      }
    }
  } else if (isFunction(children)) {
    // 如果是函数的话 children 包装成一个对象
    children = { default: children, _ctx: currentRenderingInstance }
    type = ShapeFlags.SLOTS_CHILDREN
  } else {
    children = String(children)
    if (shapeFlag & ShapeFlags.TELEPORT) {
      // TELEPORT节点
      type = ShapeFlags.ARRAY_CHILDREN
      // QUERY 没想明白为什么要 变成为数组 ?
      // 源码里面的解释是 force teleport children to array so it can be moved around
      children = [createTextVNode(children as string)]
    } else {
      // 文本节点
      type = ShapeFlags.TEXT_CHILDREN
    }
  }
  vnode.children = children as VNodeNormalizedChildren
  // 按位或 赋予 type (react 权限赋值同理)
  // 其功能是参与运算的两数各对应的二进位相或。只要对应的二个二进位有一个为1时，结果位就为1。当参与运算的是负数时，参与两个数均以补码出现。
  vnode.shapeFlag |= type
}
```

**总结**

好了我们讲完了`createVNode`函数,发现他主要做了几点:

- 解析传入的**根组件的类型**来判断需要生成什么类型的 vnode 节点 ,用于后期的节点的渲染.
- 创建了描述当前 vnode 节点 的对象,最终返回当前 vnode 对象.
- 在创建 vnode 节点 过程中对传入的节点的子节点也进行了 节点类型判断处理.

---

#### 组件初始化挂载阶段

**render**

`render 函数` 涉及到 `vue` 里的一个核心思想:**虚拟 DOM(VNode)**
`Vue` 通过建立一个**虚拟 DOM**来追踪自己要如何改变**真实 DOM**,并通过 `render函数` 生成**真实 DOM**.

```javascript
// packages/runtime-core/src/renderer.ts
const render: RootRenderFunction = (vnode, container) => {
  //TODO 不存在虚拟 DOM 走的是卸载逻辑
  if (vnode == null) {
    // 在根实例上存在 _vnode
    if (container._vnode) {
      // 进行卸载
      unmount(container._vnode, null, null, true)
    }
  } else {
    // TODO 初始化 和 更新 过程. 核心逻辑
    patch(container._vnode || null, vnode, container)
  }
  // 后续补足
  flushPostFlushCbs()
  // 在根容器对象上添加当前需要挂载的 vnode
  container._vnode = vnode
}
```

通过 `render` 函数我们发现主要的核心逻辑在 `patch` 函数内.

**patch**

```javascript
 // packages/runtime-core/src/renderer.ts
 const patch: PatchFn = (
    n1,  // 新 vnode
    n2,  // 旧 vnode
    container,  // 根容器
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    isSVG = false,
    optimized = false
  ) => {
    // TODO 前后节点不同 vue 是直接卸载之前的然后重新渲染新的，不会考虑可能的子节点复用
    // isSameVNodeType = ( n1, n2 ) => n1.type === n2.type && n1.key === n2.key
    // 从 isSameVNodeType 函数就可以看出平时 key是唯一值 对于元素比较来说是多么重要.
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1)
      unmount(n1, parentComponent, parentSuspense, true)
      n1 = null
    }
    // 特殊的标记 PatchFlags.BAIL , 不进行 diff 算法
    if (n2.patchFlag === PatchFlags.BAIL) {
      optimized = false
      n2.dynamicChildren = null
    }
    // 在创建 vnode 的时候会去判断当前组件的类型
    // 初始化时 因为传入的是个对象 所以赋值为 状态组件 所以相对应的会去触发 processComponent 方法
    const { type, ref, shapeFlag } = n2
    switch (type) {
      // 文本节点类型
      case Text:
        processText(n1, n2, container, anchor)
        break
      // 注释节点
      case Comment:
        processCommentNode(n1, n2, container, anchor)
        break
      // 静态节点 在创建 VNode 的时候如果没有根组件的时候 元素类型就会被标记为静态节点
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG)
        }
        break
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        )
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element 节点类型
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized
          )
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 处理 有状态组件 和 功能组件(函数组件)
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized
          )
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          // Vue3 新增 TELEPORT 组件
          ;(type as typeof TeleportImpl).process(
            n1 as TeleportVNode,
            n2 as TeleportVNode,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized,
            internals
          )
        } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
           // Vue3 新增 SUSPENSE 组件
          ;(type as typeof SuspenseImpl).process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            optimized,
            internals
          )
        }
    }

    // 设置 ref 逻辑 ( 后续补足 初始化暂时不涉及 )
    if (ref != null && parentComponent) {
      setRef(ref, n1 && n1.ref, parentSuspense, n2)
    }
  }
```

**总结**

其实别看`patch`函数这么长做的功能其实就以下几点

1. 判断新旧 VNode 是否一致,不一致**直接卸载旧的 VNode**,然后重新渲染新的,**不会考虑可能的子节点复用**.**( 就是我们常说的同级比较 )**
2. 根据创建 VNode 时判断的**节点类型(type)**和**节点类型标识(ShapeFlags)**,进入对应的渲染函数.
3. setRef( 后续补足 初始化暂时不涉及 )

接下来看看怎么进行组件渲染的应该也是最关心的逻辑了.

**processComponent**

```javascript
  // packages/runtime-core/src/renderer.ts
  // 组件渲染
  const processComponent = (
    n1: VNode | null,   // 新 vnode
    n2: VNode,          // 旧 vnode
    container: RendererElement,  //根容器
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    isSVG: boolean,
    optimized: boolean
  ) => {
    //TODO 没有新 vnode 时 就是挂载组件,否者会进入更新逻辑
    if (n1 == null) {
      // 判断是否是 keep-alive
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        // 获取父级
        // activate keep-alive 方法 后续讲到 KeepAliveContext 再抽出来单独说
        ;(parentComponent!.ctx as KeepAliveContext).activate(
          n2,
          container,
          anchor,
          isSVG,
          optimized
        )
      } else {
        //TODO 挂载组件初始化组件
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        )
      }
    } else {
      //TODO 否者会进入更新逻辑
      updateComponent(n1, n2, optimized)
    }
  }
```

**总结**

通过是否存在 **新 vnode** 来判断是否是进入 **初始化逻辑(mount)** 还是 **更新逻辑(update)**

**mountComponent**

挂载过程分3个阶段
- [初始化组件实例 - createComponentInstance](#createComponentInstance)
- [安装组件:组件初始化 - setupComponent](#setupComponent)
- [安装渲染函数 - setupRenderEffect](#setupRenderEffect)

```javascript
// 省略部分 DEV 环境代码
// packages/runtime-core/src/renderer.ts
const mountComponent: MountComponentFn = (
    initialVNode,  // 初始化 vnode  其实就是 根组件节点生成的 VNode ( 有点拗口. )
    container,  // 根容器
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    optimized
  ) => {
    // TODO 1.初始化组件实例
    const instance: ComponentInternalInstance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    ))

    // inject renderer internals for keepAlive
    // 判断是否是 keepAlive 元素 注入当前元素实例
    if (isKeepAlive(initialVNode)) {
      // 方便后续直接调用
      ;(instance.ctx as KeepAliveContext).renderer = internals
    }

    //TODO 2.安装组件:组件初始化
    // 1.实际就是对 props 和 slots 进行处理
    // 2.劫持了上下文
    // 3.setup(effect) 执行后返回的结果 并且在内部进行错误捕获
    setupComponent(instance)

    // setup() is async. This component relies on async logic to be resolved
    // before proceeding
    if (__FEATURE_SUSPENSE__ && instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect)
      // Give it a placeholder if this is not hydration
      // TODO handle self-defined fallback
      if (!initialVNode.el) {
        const placeholder = (instance.subTree = createVNode(Comment))
        processCommentNode(null, placeholder, container!, anchor)
      }
      return
    }

    // TODO 3.安装渲染函数
    setupRenderEffect(
      instance,
      initialVNode,
      container,
      anchor,
      parentSuspense,
      isSVG,
      optimized
    )
  }

```

<span id="createComponentInstance">**createComponentInstance**</span>

createComponentInstance 比较简单,进行了创建**实例并绑定上下文和根节点**,最后注册 emit 方法.

```javascript
// packages/runtime-core/src/component.ts
export function createComponentInstance(
  vnode: VNode,
  parent: ComponentInternalInstance | null,
  suspense: SuspenseBoundary | null
) {
  const type = vnode.type as ConcreteComponent
  //  父级节点上下文 ? 父级节点上下文 : 当前节点上下文  || 创建新节点
  const appContext =
    (parent ? parent.appContext : vnode.appContext) || emptyAppContext
  // 实例对象
  const instance: ComponentInternalInstance = {
    // ...省略实例对象属性  感兴趣的可以去看看源码
  }

  // 绑定上下文
  instance.ctx = { _: instance }

  // 实例的根节点如果没有父级就是自身
  instance.root = parent ? parent.root : instance
  // 注册 emit 方法
  instance.emit = emit.bind(null, instance)
  //TODO 阿宝哥的 emit 的实现解析  https://www.imooc.com/article/316907

  return instance
}


```

<span id="setupComponent">**setupComponent**</span>

- 对 props 和 slots 进行处理
- 劫持了上下文
- setup(effect) 执行后返回的结果 并且在内部进行错误捕获

```javascript
// packages/runtime-core/src/component.ts
export function setupComponent(
  instance: ComponentInternalInstance,
  isSSR = false
) {
  // SSR
  isInSSRComponentSetup = isSSR

  const { props, children, shapeFlag } = instance.vnode
  // 判断是否是状态组件 按位与  & 4
  const isStateful = shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  // 初始化
  // initProps -> setFullProps -> normalizePropsOptions <-> normalizePropsOptions
  // 细节逻辑
  // 根据你组件的props声明来把属性放到 props 或者 attrs 里面
  initProps(instance, props, isStateful, isSSR)
  initSlots(instance, children)
  // 判断是否进行状态设置 具体做了什么看 setupStatefulComponent 方法
  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined
  isInSSRComponentSetup = false
  return setupResult
}
```

**setupStatefulComponent**

着重理解为什么要在 setup 函数执行前为什么要调用 pauseTracking 函数.

```javascript
// packages/runtime-core/src/component.ts
function setupStatefulComponent(
  instance: ComponentInternalInstance,
  isSSR: boolean
) {
  // 省略部分 DEV 环境代码
  const Component = instance.type as ComponentOptions

  // 在实例上创建了访问缓存对象
  instance.accessCache = Object.create(null)

  // 首先我们创建了instance.proxy，这个其实就是我们在使用 option api 的时候的this，所以这里要创建一个 proxy，在你调用this.xxx的时候他才能响应式得作出反应。
  // 代理了上下文
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  const { setup } = Component
  // 存在 setup
  if (setup) {
    // 创建上下文  setup 内可以直接访问属性 context
    // setup 参数大于 1 时 调用 createSetupContext 函数 创建上下文
    const setupContext = (instance.setupContext =
      setup.length > 1 ? createSetupContext(instance) : null)
    // 设置当前实例
    currentInstance = instance

    // TODO 重点 暂停响应式 不理解后续会在 reactive模块 内里面进行详细的解析
    /**
     * 在执行setup的时候，我们的 state 其实是一个 reactive 的对象，
     * 后续我们调用state.a的时候，其实就是把当前的方法上下文(setup 方法)作为state对象的依赖进行保存，
     * 也就是说以后state.a修改的时候setup会重新调用！这自然是我们不希望看到的，
     * 因为其实setup只是创建这些响应式对象，其本身自然不应该依赖于他们的变化，
     * 那么pauseTracking就是告诉响应式系统，接下去我们执行的方法就不要记录依赖了
     * 等到 setup 执行完毕后再进行响应式追踪
     */
    pauseTracking()

    //TODO 执行 setup 完毕后会对内部一些函数进行执行. 比如 reactive 那么这个时候就会进入到依赖收集过程
    // setup(effect) 执行后返回的结果 并且在内部进行错误捕获
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      ErrorCodes.SETUP_FUNCTION,
      [__DEV__ ? shallowReadonly(instance.props) : instance.props, setupContext]
    )
    // TODO 重置响应式
    resetTracking()
    // 执行完毕后置空
    currentInstance = null

    // 异步渲染
    if (isPromise(setupResult)) {
      if (isSSR) {
        // return the promise so server-renderer can wait on it
        return setupResult.then((resolvedResult: unknown) => {
          handleSetupResult(instance, resolvedResult, isSSR)
        })
      } else if (__FEATURE_SUSPENSE__) {
        // async setup returned Promise.
        // bail here and wait for re-entry.
        instance.asyncDep = setupResult
      }
    } else {
      // setup 执行后返回的结果
      handleSetupResult(instance, setupResult, isSSR)
    }
  } else {
    // 不存在 setup
    // TODO 内部进行了对 Vue2 的兼容 ?
    finishComponentSetup(instance, isSSR)
  }
}
```

**总结**

通过 setupStatefulComponent 我们发现了该函数主要功能是:

- 代理了上下文
- 当 setup 参数大于 1 时创建上下文
- 执行了 setup
- 通过 handleSetupResult 函数 处理 setup 函数 执行后的结果

顺着逻辑我们再去看看 handleSetupResult 函数 到底做了什么吧


**handleSetupResult**

通过 setupStatefulComponent 函数 我们知道了该函数主要的作用是对于 setup 函数 执行完成后的结果进行操作.

```javascript
// packages/runtime-core/src/component.ts
export function handleSetupResult(
  instance: ComponentInternalInstance,  // 当前实例
  setupResult: unknown,  // setup(effect) 执行后返回的结果
  isSSR: boolean   // 是否是 SSR
) {
  // 判断 setupResult(返回结果) 是否是函数
  if (isFunction(setupResult)) {
    // 可能返回的是个 render 渲染函数
    if (__NODE_JS__ && (instance.type as ComponentOptions).__ssrInlineRender) {
      // SSR
      instance.ssrRender = setupResult
    } else {
      // 挂载到当前实例上 render 渲染函数
      instance.render = setupResult as InternalRenderFunction
    }
  } else if (isObject(setupResult)) {
    // 判断 setupResult(返回结果) 是否是对象 就是我们在开发过程中正常的返回
    // 通过 proxyRefs 函数发现了对返回的对象进行了代理(暂时没想明白为什么要进行代理)
    instance.setupState = proxyRefs(setupResult)
  }
  // 最后一步完成设置
  finishComponentSetup(instance, isSSR)
}
```

**总结**

主要的逻辑:根据 setup(effect) 执行后返回的结果 来进行区分在当前实例上挂载 render 属性 或 代理后的 setupState 属性,最终执行 finishComponentSetup 函数

**finishComponentSetup**

```javascript
// packages/runtime-core/src/component.ts
function finishComponentSetup(
  instance: ComponentInternalInstance,
  isSSR: boolean
) {
  // 获取当前 实例的 节点
  const Component = instance.type as ComponentOptions

  if (__NODE_JS__ && isSSR) {
    if (Component.render) {
      instance.render = Component.render as InternalRenderFunction
    }
  } else if (!instance.render) {
    // 没用 render 方法 会把 template 编译成 render 方法
    // could be set from setup()
    // compile 会通过 registerRuntimeCompiler 方法进行注册 请查看 packages/vue/src/index.ts 文件
    if (compile && Component.template && !Component.render) {
      Component.render = compile(Component.template, {
        isCustomElement: instance.appContext.config.isCustomElement,
        delimiters: Component.delimiters
      })
    }
    // 在实例上挂载 render属性 其实就是当前 节点render方法
    instance.render = (Component.render || NOOP) as InternalRenderFunction

    // 看了 Vue 原始的 compile 方法发现执行到最后 instance.render._rc 属性总是为 true
    // 这部分有兴趣的可以去看看 compileToFunction 函数, 在packages/vue/src/index.ts 文件内.这里暂不做展开
    if (instance.render._rc) {
      instance.withProxy = new Proxy(
        instance.ctx,
        RuntimeCompiledPublicInstanceProxyHandlers
      )
    }
  }

  // 兼容 2.0
  if (__FEATURE_OPTIONS_API__) {
    currentInstance = instance
    pauseTracking()
    // 兼容Vue2.x，合并配置项到vue组件实例，初始化watch、computed、methods等配置项，调用相关生命周期钩子
    applyOptions(instance, Component)
    resetTracking()
    currentInstance = null
  }
}
```

**总结**

主要的逻辑:在实例上挂载 render 属性.其实就是当前 节点 render 方法.最终合并配置项到 vue 组件实例，初始化 watch、computed、methods 等配置项，调用相关生命周期钩子.

> 以上就是组件初始化的过程.接下来也是我们最终安装渲染函数过程(effect 收集)


<span id="setupRenderEffect">**setupRenderEffect**</span>

其实里面还涉及到渲染部分的知识点.后续再整个画一个流程图补充一下
主要还是先关注 effect 副作用收集部分吧

```javascript
// packages/runtime-core/src/renderer.ts
  const setupRenderEffect: SetupRenderEffectFn = (
    instance,  // 组件实例
    initialVNode,  // 初始化 vnode  其实就是 根组件节点生成的 VNode
    container,
    anchor,
    parentSuspense,
    isSVG,
    optimized
  ) => {
    // TODO 副作用 effect 把组件的更新函数添加副作用函数 将来数据更新重新渲染
    // 通过 instance.update 方法对 已经收集到的 effect 进行执行更新
    instance.update = effect(function componentEffect() {
      // 先判断当前实例是否已经挂载
      if (!instance.isMounted) {
        // 初始化流程
        let vnodeHook: VNodeHook | null | undefined
        const { el, props } = initialVNode
        const { bm, m, parent } = instance

        // beforeMount hook
        if (bm) {
          invokeArrayFns(bm)
        }
        // onVnodeBeforeMount
        // beforeMount生命周期 注意这里是 vnode
        if ((vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode)
        }
        // TODO 其实渲染这部分应该在渲染里面讲的...
        // TODO 核心 渲染根节
        // 原理都是调用之前绑定在实例上的 render 函数进行渲染
        // renderComponentRoot源码位置 => packages/runtime-core/src/componentRenderUtils.ts
        const subTree = (instance.subTree = renderComponentRoot(instance))
        // TODO 核心 渲染子树 patch 方法在渲染模块内介绍过.可以网上翻翻
        if (el && hydrateNode) {
          // vnode has adopted host node - perform hydration instead of mount.
          hydrateNode(
            initialVNode.el as Node,
            subTree,
            instance,
            parentSuspense
          )
        } else {
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            isSVG
          )
          initialVNode.el = subTree.el
        }
        // 对于生命周期这块的触发逻辑后续补足
        // mounted hook
        // 把mounted生命周期方法加入到队列
        if (m) {
          queuePostRenderEffect(m, parentSuspense)
        }
        // onVnodeMounted
        if ((vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode
          queuePostRenderEffect(() => {
            invokeVNodeHook(vnodeHook!, parent, scopedInitialVNode)
          }, parentSuspense)
        }
        // keep-alive 逻辑
        // activated hook for keep-alive roots.
        // #1742 activated hook must be accessed after first render
        // since the hook may be injected by a child keep-alive
        const { a } = instance
        if (
          a &&
          initialVNode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
        ) {
          queuePostRenderEffect(a, parentSuspense)
        }
        // 更改标记状态
        instance.isMounted = true

        // 释放引用避免内存泄露导致出现过个实例
        // Vue3 issues #2458: deference mount-only object parameters to prevent memleaks
        initialVNode = container = anchor = null as any
      } else {
        // ...省略了update 过程
      }
    }, prodEffectOptions)
  }
```

**总结**

通过对当前实例 isMounted 状态来判断是 update 还是 mounted.并且注册对应的生命周期.
值得注意的是:

- mounted 时会通过传入的实例创建对应的树,并且通过 patch 方法对整棵树进行渲染
- update 时会通过传入的实例创建对应的新的树,并把新树和老树进行比对找出差异

**effect**

来看看 effect 到底做了什么

```javascript
// packages/reactivity/src/effect.ts
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  // 判断下传入的 componentEffect
  if (isEffect(fn)) {
    fn = fn.raw
  }
  // 通过传入的 componentEffect 创建对应的 ReactiveEffect
  const effect = createReactiveEffect(fn, options)
  // 如果 lazy 不为 true 则直接调用 创建完成的 effect
  if (!options.lazy) {
    // 进入数据渲染及依赖收集环节
    effect()
  }
  // 返回 effect
  return effect
}
```
**总结**

通过传入的 componentEffect (其实就是包裹着渲染函数的回调函数) 和 options 生成最终的effect(副作用函数).并且执行
整个过程其实可以理解为  effect() => 组件渲染

**createReactiveEffect**

创建 effect 对象

这部分如果没有看数据响应式模块的话可能有些比较难理解不知道是干什么的.后续会在数据响应式篇内会进行解析
```javascript
// TODO 生成effect
function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
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
        //启用追踪
        enableTracking()
        // 把当前 effect 放入 effectStack 中
        effectStack.push(effect)
        // 然后讲 activeEffect 设置为当前的 effect
        // 主要的作用就是在 触发 track 依赖搜集的时候 建立一个映射关系
        activeEffect = effect
        // fn 并且返回值
        return fn()
      } finally {
        // 当这一切完成的时候，finally 阶段，会把当前 effect 弹出，恢复原来的收集依赖的状态，还有恢复原来的 activeEffect。
        effectStack.pop()
        // 重置追踪
        resetTracking()
        // 最终要重置一下不然会出现依赖对应的实例错误
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

----------

往期文章:
[Vue3 解析系列之createAppAPI函数](https://juejin.cn/post/7000186937805897742)

> 本文是 Vue3 解析的第二篇.后续将进行 Vue3 数据响应式阶段的解析.
