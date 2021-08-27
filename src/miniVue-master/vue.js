class Vue {
  constructor(options) {
    // 1.通过数据存储数据
    this.$options = options || {} // save options
    this.$el =
      typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el // get dom
    this.$data = options.data // get data
    this.$methods = options.methods
    // 2.将数据变getter\setter，注入到vue实例中
    this._proxyData(this.$data)
    // 3.调用observe对象，监听数据变化
    new Observer(this.$data)
    // 4.调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }
  // VUE 使用 Proxy 代理实现数据响应式 1.代理的是整个数据 2.兼容性不是太好，不兼容IE，且无法通过polyfill提供兼容。
  // 区别 数据代理
  //  Proxy返回的是一个新对象,我们可以只操作新的对象达到目的,而Object.defineProperty只能遍历对象属性直接修改。
  // Vue2.0 ==== 实现
  _proxyData(data) {
    // VUE2 实现数据劫持实现数据响应式 1.劫持的是对象的属性,2.兼容性好
    // 遍历所有data
    Object.keys(data).forEach(key => {
      // 将data属性注入到vue中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
  // Vue3.0 ==== 实现
  // reactive(obj) {
  //   if (typeof obj !== 'object' && obj != null) {
  //     return obj
  //   }
  //   // Proxy相当于在对象外层加拦截
  //   // http://es6.ruanyifeng.com/#docs/proxy
  //   const observed = new Proxy(obj, {
  //     get(target, key, receiver) {
  //       // Reflect用于执行对象默认操作，更规范、更友好
  //       // Proxy和Object的方法Reflect都有对应
  //       // http://es6.ruanyifeng.com/#docs/reflect
  //       const res = Reflect.get(target, key, receiver)
  //       console.log(`获取${key}:${res}`)
  //       return res
  //     },
  //     set(target, key, value, receiver) {
  //       const res = Reflect.set(target, key, value, receiver)
  //       console.log(`设置${key}:${value}`)
  //       return res
  //     },
  //     deleteProperty(target, key) {
  //       const res = Reflect.deleteProperty(target, key)
  //       console.log(`删除${key}:${res}`)
  //       return res
  //     }
  //   })
  //   return observed
  // }
}
