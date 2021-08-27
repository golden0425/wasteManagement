let currentEffect = null

// effect
function watchEffect(effect) {
  // 1.收集回调
  currentEffect = effect
  // 2. 触发(create 生命周期)
  effect()
  // 3.收集完毕置空
  currentEffect = null
}

// 属性订阅器
class Dep {
  constructor(value) {
    this.effects = new Set()
    this._value = value
  }
  // get的时候进行回调收集
  get value() {
    this.depend()
    return this._value
  }
  // set的时候进行回调触发
  set value(newVal) {
    this._value = newVal
    // 注意更新值后再进行回调触发
    this.notice()
  }
  // 1.收集方法(回调收集)
  depend() {
    if (currentEffect) {
      this.effects.add(currentEffect)
    }
  }
  // 2.更新方法(回调触发)
  notice() {
    this.effects.forEach((effect) => effect())
  }
}

let targetMap = new WeakMap()
// { age: 18 } => map { 'age' => Dep { effects: Set {  }, _value: undefined } }

function getDep(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      let dep = getDep(target, key)
      // get 的时候属性订阅器 depend 收集
      dep.depend()
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      let dep = getDep(target, key)
      let result = Reflect.set(target, key, value)
      // get 的时候属性订阅器 notice 进行更新
      dep.notice()
      return result
    },
  })
}

// ---------------------------------------
let xm = reactive({ age: 18 })

watchEffect(() => {
  console.log(xm.age)
})

xm.age = 19
