## Vue3 解析系列之 createAppAPI 函数

> 前言:本文是基于 Vue 3.0.5 进行解析,主要用于个人学习梳理流程.也是第一次正儿八经的写文章.如果不对请指正.

### 目录

1.  [createAppAPI](#1)

#### <span id="1">一、createAppAPI 做了什么</span>

**前言**
抛出 1 个问题:

- 为什么 **Vue3** 要通过 `createApp({setup(){}}).mount('#app')` 这种方式函数方式去执行呢,而不是沿用 **Vue2** 通过`new Vue()` 的方式呢?

话不多说上源码

**createAppAPI**

```javascript
// packages/runtime-core/src/apiCreateApp.ts
export function createAppAPI<HostElement>(
  render: RootRenderFunction,
  hydrate?: RootHydrateFunction
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    // 省略 createApp 内部代码
  }
}
```

其实 createAppAPI 只是 createApp 实现的一个包装器.继续往下看主要实现 createApp 方法都干了什么.

**createApp**

```javascript
// 省略部分 DEV 环境代码
// packages/runtime-core/src/apiCreateApp.ts
return function createApp(rootComponent, rootProps = null) {
  // 上下生成工厂函数 主要的用处就是初始化一些数据 见后续
  const context = createAppContext()
  const installedPlugins = new Set()
  // 标记下挂载状态
  let isMounted = false

  const app: App = (context.app = {
  _uid: uid++,
  _component: rootComponent as ConcreteComponent,
  _props: rootProps,
  _container: null,
  _context: context,
  version,

  // 省略部分代码
  // 插件安装
  use(plugin: Plugin, ...options: any[]) {
    /*
    * TODO 优点: ( 解释了开头提出的问题 )
    * vue2 Vue.use(vueRouter)
    * vue3 app.use(vueRouter)
    * 1.全局配置会污染
    * 2.treeshaking 摇树优化
    * 3.语义化
    */

    // installedPlugins是个 set 对象 key唯一

    if (plugin && isFunction(plugin.install)) {
      installedPlugins.add(plugin)
      plugin.install(app, ...options)
    } else if (isFunction(plugin)) {
      installedPlugins.add(plugin)
      plugin(app, ...options)
    }
    return app
  },
  // 全局混入
  mixin(mixin: ComponentOptions) {
    // 核心逻辑
    if (!context.mixins.includes(mixin)) {
        context.mixins.push(mixin)
        // 判断混入的组件是否存在 props | emits 属性,如果存在则不会进行数据合并处理( 后续补足 )
        if (mixin.props || mixin.emits) {
          context.deopt = true
        }
      }
    return app
  },
  // 全局的组件挂载
  component(name: string, component?: Component): any {
    // 没有传入component创建方法的直接返回已绑定的值 undefined 或者已经注册的创建方法
    if (!component) {
      return context.components[name]
    }
    // 挂载到组件对象
    context.components[name] = component
    return app
  },
  // 全局的自定义指令挂载
  directive(name: string, directive?: Directive) {
    // 逻辑和组件挂载差不多
    if (!directive) {
      return context.directives[name] as any
    }
    context.directives[name] = directive
    return app
  },

  /**
    * TODO 挂载阶段 重点
    * @param {HostElement} rootContainer 挂载的元素节点
    * @param {boolean} [isHydrate]
    * @return {*}  {*}
    */
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
  // 卸载
  unmount() {
    // render 函数 第一个参数是 vnode, 会进行判断如果没有 vnode 并且在根实例上存在 _vnode,就会调用 unmount 方法进行卸载
    if (isMounted) {
      render(null, app._container)
    }
  },
  // 全局的 provide
  provide(key, value) {
    /*
     * 设置一个可以被注入到应用范围内所有组件中的值。组件应该使用 inject 来接收提供的值。
     * Note
     * provide 和 inject 绑定不是响应式的。这是有意为之。
     * 不过，如果你向下传递一个响应式对象，这个对象上的 property 会保持响应式。
    */
    context.provides[key as string] = value
    return app
  }
})

return app
}
```

**Vue 上下文创建 createAppContext **

```javascript
// packages/runtime-core/src/apiCreateApp.ts
export function createAppContext(): AppContext {
  return {
    app: null as any,
    config: {
      // const NO = () => false
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      isCustomElement: NO,
      errorHandler: undefined,
      warnHandler: undefined
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null)
  }
}
```

**总结**

在 `createAppAPI`函数内我们发现了其主要的功能就是创建了一个 **Vue 的实例** .并对当前 Vue 实例进行全局数据和上下文进行绑定.最终通过调用 `mount` 的方法进行元素挂载

> 本文是 Vue3 解析的第一篇.后续将进行 **Vue3 挂载阶段的解析** .
