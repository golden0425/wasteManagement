## Vue3 解析

> 前言:本文是基于 Vue 3.0.5 进行解析,主要用于个人学习梳理流程.也是第一次正儿八经的写文章.如果不对请指正.

### 目录

1.  [createAppAPI](#1)

#### <span id="1">一、createAppAPI 做了什么</span>

抛出 2 个问题:

- 为什么 **Vue3** 要通过 `createApp({setup(){}}).mount('#app')` 这种方式函数方式去执行呢,而不是沿用 **Vue2** 通过`new Vue()` 的方式呢?
- 这样做有什么好处呢?

话不多说上源码

```javascript
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

```javascript
// 省略部分 DEV 环境代码
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
    // vue2 Vue.use(vueRouter)
    // vue3 app.use(vueRouter)
    //  TODO 优点:
    // 1.全局配置会污染
    // 2.treeshaking 摇树优化
    // 3.语义化

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
      //
      return vnode.component!.proxy
    }
  },
  // 卸载
  unmount() {
    if (isMounted) {
      render(null, app._container)
      if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
        devtoolsUnmountApp(app)
      }
    } else if (__DEV__) {
      warn(`Cannot unmount an app that is not mounted.`)
    }
  },
  provide(key, value) {
    if (__DEV__ && (key as string | symbol) in context.provides) {
      warn(
        `App already provides property with key "${String(key)}". ` +
          `It will be overwritten with the new value.`
      )
    }
    // TypeScript doesn't allow symbols as index type
    // https://github.com/Microsoft/TypeScript/issues/24587
    context.provides[key as string] = value

    return app
  }
})

return app
}
```

```javascript
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
