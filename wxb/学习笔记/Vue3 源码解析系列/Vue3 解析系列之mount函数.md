## Vue3 解析系列之 mount 函数

> 前言:本文是基于 Vue 3.0.5 进行解析,主要用于个人学习梳理流程.也是第一次正儿八经的写文章.如果不对请指正.

### 目录

1.  [mount](#2)

#### <span id="2">二、mount 做了什么</span>

**前言**

在上一期 Vue3 解析系列中我们对 **`createAppAPI函数`** 进行了解析,但是并没有对核心方法 **`mount` 挂载逻辑** 进行解析.本期会分 ** `创建VNode` , `元素渲染(render)` , `effect收集` 等几个部分** 来对于**初始化元素渲染**进行解析.

话不多说上源码:

先进入到 `mount` 函数内部.发现了里面有 2 个关键函数 `createVNode`,`render`,这两个函数也可以说是 Vue 的核心逻辑.具体是做什么的继续往下看.

```javascript
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

#### VNode

**createVNode**

看函数名也能知道这个函数是拿来创建 `VNode` 的.经常在面试的时候会被面试官问到什么是 `VNode` 呢,有什么作用呢,为什么需要 VNode? 不瞒大家说我也是被吊打的哪一位.

- VNode 是 JavaScript 对象,也可以理解成节点描述对象,他描述了应该怎样去创建真实的 DOM 节点.

- VNode 的作用:通过 render 将 template 模版描述成 VNode，然后进行一系列操作之后形成真实的 DOM 进行挂载。

- VNode 的优点
  1. 兼容性强，不受执行环境的影响。VNode 因为是 JS 对象，不管 Node 还是浏览器，都可以统一操作，从而获得了服务端渲染、原生渲染、手写渲染函数等能力。
  2. 减少操作 DOM，任何页面的变化，都只使用 VNode 进行操作对比，只需要在最后一步挂载更新 DOM，不需要频繁操作 DOM，从而提高页面性能。

下面来看看源码

```javascript
// 省略部分 DEV 环境代码
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
