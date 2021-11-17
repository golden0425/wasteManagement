## 3.2 新特性

> 最近看了 Vue 3.2 的更新.对于一些新特性的整理

- SSR：服务端渲染优化。@vue/server-renderer 包加了一个 ES 模块创建，与 Node.js 解耦，使在非 Node 环境用@vue/serve-render 做服务端渲染成为可能，比如(Workers、Service Workers)
- New SFC Features：新的单文件组件特性 Web
- Components：自定义 web 组件。这个我们平时很少用到，但是应该知道
- Effect Scope API： effect 作用域，用来直接控制响应式副作用的释放时间(computed 和 watchers)。这是底层库的更新，开发不用关心，但是应该知道
- Performance Improvements：性能提升。这是内部的提升，跟开发无关

先介绍一下开发相关的变更
新特性和 API

#### v-bind

可以在 style 标签里使用 v-bind，如下

```javascript
<template>
  <div>{{ color }}</div>
  <button @click = "color = color === 'red' ? 'green' : 'red'">按钮</button>
</template>

<script setup>
import { ref } from 'vue'
const color = ref('ref')
</script>

<style scoped>
div {
  color: v-bind(color);
}
</style>

```

#### useAttrs、useSlots、defineExpose、defineEmit、withDefaults

原来的 useContext 是这样的，现在下面这个都不能用了

```javascript
import { useContext } from 'vue'
const { expose, slots, emit, attrs } = useContext()
```

由于 expose、slots、emit、attrs 都不能通过 useContext 获取.增加了几个新的 API

- useAttrs
  可以是用来获取 attrs 数据的（**也就是非 props 的属性值**）

```javascript
// 导入 useAttrs 组件
import { useAttrs } from 'vue'

// 获取 attrs
const attrs = useAttrs()

// attrs是个对象，和 props 一样，需要通过 key 来得到对应的单个 attr
console.log(attrs.msg)
```

- useSlots

通过 API 的命名也能了解它是用来获取插槽数据的
主要针对 JSX / TSX

```javascript
// 父组件
<template>
  <!-- 子组件 -->
  <ChildTSX>
    <!-- 默认插槽 -->
    <p>I am a default slot from TSX.</p>
    <!-- 默认插槽 -->

    <!-- 命名插槽 -->
    <template #msg>
      <p>I am a msg slot from TSX.</p>
    </template>
    <!-- 命名插槽 -->
  </ChildTSX>
  <!-- 子组件 -->
</template>
<script setup lang="ts">
import ChildTSX from '@cp/context/Child.tsx'
</script>

// 子组件
import { defineComponent, useSlots } from 'vue'
const ChildTSX = defineComponent({
  setup() {
    // 获取插槽数据
    const slots = useSlots()

    // 渲染组件
    return () => (
      <div>
        // 渲染默认插槽
        <p>{ slots.default ? slots.default() : '' }</p>

        // 渲染命名插槽
        <p>{ slots.msg ? slots.msg() : '' }</p>
      </div>
    )
  },
})

export default ChildTSX
```

- 新增 defineExpose API

在标准组件写法里，子组件的数据都是默认隐式暴露给父组件的，但在 script-setup 模式下，所有数据只是默认 return 给 template 使用，不会暴露到组件外，所以父组件是无法直接通过挂载 ref 变量获取子组件的数据。

如果要调用子组件的数据，需要先在子组件显示的暴露出来，才能够正确的拿到，这个操作，就是由 expose 来完成。

```javascript
// 导入 defineExpose 组件
import { defineExpose } from 'vue'

// 定义数据
const msg: string = 'Hello World!'

// 暴露给父组件
defineExpose({
  msg,
})
```

- 改名 defineEmits API
  使用 defineEmits 取待原来的 defineEmit API ，也就是改名了。

```javascript
// 导入 defineEmits 组件
import { defineEmits } from 'vue'

// 获取 emit
const emit = defineEmits(['say-hi', 'chang-name'])

// 调用 emit 打招呼
emit('say-hi', 'Hello!')

// 调用 emit 改名
emit('chang-name', 'Tom')
```

- 新增 withDefaults API
  本次是带来了一个全新的 withDefaults API，用于辅助 defineProps 来指定 prop 的默认值。

在你用 TypeScript 编程时，defineProps 有两种类型指定方式：

1. 通过构造函数进行检查（传统方法）
   第一种方式是使用 JavaScript 原生构造函数进行类型规定，使用这种方法时，如果你要限制 props 的类型和默认值，需要通过一个 “对象” 入参来传递给 defineProps，比如：

```javascript
// 导入 defineProps 组件
import { defineProps } from 'vue'

// 定义 props
defineProps({
  name: {
    type: String,
    required: false,
    default: 'Petter',
  },
  userInfo: Object,
  tags: Array,
})
```

2. 使用类型注解进行检查（TS 专属）
   第二种方式是按照 TS 的书写习惯来定义数据类型，这种情况下需要遵循 TypeScript 的类型规范，比如字符串是 string，而不是 String。

```typescript
// 导入 defineProps 组件
import { defineProps } from 'vue'

// 对象类型接口
interface UserInfo {
  id: number
  age: number
}

// 定义 props
defineProps<{
  name: string
  phoneNumber: number
  userInfo: UserInfo
  tags: string[]
}>()
```

在此之前，使用第二种方法，是无法指定默认值的（在当时的 RFC 的文档里也有说明无法指定）。

如今，这个新的 withDefaults API 可以让你在使用 TS 类型系统时，也可以指定 props 的默认值。

它接收两个入参：
props => object => 通过 defineProps 传入的 props
defaultValue => object => 根据 props 的 key 传入默认值

```typescript
import { defineProps, withDefaults } from 'vue'

withDefaults(
  defineProps<{
    size?: number
    labels?: string[]
  }>(),
  {
    size: 3,
    labels: () => ['default label'],
  }
)
```

#### 自定义 web 组件 defineCustomElement

> 实现原理 customElements API 配合 attachShadow 进行生成

```typescript
import { defineCustomElement } from 'vue'
const MyVueElement = defineCustomElement({
  // 通用 vue 组件选项
  props: ['foo'],
  render() {
    return h('div', 'my-vue-element:' + this.foo)
  },
})
```

#### v-memo

长列表优化

> v-memo 具有空依赖项数组 ( v-memo="[]") 在功能上等同于 v-once.

```javascript
<div v-memo="[valueA, valueB]">
  ...
</div>

<div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
  <p>ID: {{ item.id }} - selected: {{ item.id === selected }}</p>
  <p>...more child nodes</p>
</div>
```
