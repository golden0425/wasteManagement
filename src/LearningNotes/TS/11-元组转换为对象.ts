/**
### 题目

  > 欢迎 PR 改进翻译质量。

传入一个元组类型，将这个元组类型转换为对象类型，这个对象类型的键 / 值都是从元组中遍历出来。

例如：

```ts
  const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

  const result: TupleToObject<typeof tuple> // expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
  ```
*/

const tuple = ['tesla', 'model 3', 'model X', 'model Y']

// 1.首先要继承为数组类型
// 2.in 循环 通过下标去获取每个类型

type TupleToObject<T extends readonly any[]> = {
  [K in T[number]]: K
}
type a = TupleToObject<typeof tuple>
