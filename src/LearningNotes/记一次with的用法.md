## With 关键字

**记录一次 with 的用法**

### with的基本用法

with 通常被当做重复引用同一个对象中的多个属性的快捷方式，可以不需要重复引用对象本身。

主要作用 : **延长作用域**

`````javascript
// 目前有个变量:
let obj = {
  a:1,
  b:2,
  c:3
};
// 需要改变变量内的每个属性:
obj.a = 2;
obj.b = 3;
obj.c = 4;
// 使用 with 可以精简到:
with(obj) {
  a = 3;
  b = 4;
  c = 5;
}
`````



在这段代码中，使用了 with 语句关联了 obj 对象，这就以为着在 with 代码块内部，每个变量首先被认为是一个局部变量，如果局部变量与 obj 对象的某个属性同名，则这个局部变量会指向 obj 对象属性。



---------



### With弊端

##### 导致数据泄漏

`````javascript
function foo(obj) {
  with(obj)	{
    a = 3;
  }
};

let o1 = {
  a:1
};

let o2 = {
  b:2
};

foo(o1);
console.log(o1.a); // 3

foo(o2);
console.log(o2.a); // undefined 
console.log(a); // 3, a 被泄露到了全局上


`````



我们来分析上面的代码。例子中创建了 o1 和 o2 两个对象。其中一个有 a 属性，另外一个没有。`foo(obj)` 函数接受一个 obj 的形参，该参数是一个对象引用，并对该对象引用执行了 `with(obj) {...}`。在 with 块内部，对 a 有一个词法引用，实际上是一个 LHS引用，将 2 赋值给了它。

当我们将 o1 传递进去，`a = 2 ` 赋值操作找到了 o1.a 并将 2 赋值给它。而当 o2 传递进去，o2 并没有 a 的属性，因此不会创建这个属性，o2.a 保持 undefined。

**但为什么对 o2的操作会导致数据的泄漏呢？**

这里需要回到对` LHS`查询 的机制问题

当我们传递 o2 给 with 时，with 所声明的作用域是 o2, 从这个作用域开始对 a 进行 `LHS`查询。o2 的作用域、foo(…) 的作用域和全局作用域中都没有找到标识符 a，因此在**非严格模式**下，会自动在全局作用域创建一个全局变量），在**严格模式**下，会抛出`ReferenceError` 异常。



> 另一个不推荐 with 的原因是。在严格模式下，with 被完全禁止，间接或非安全地使用 eval(…) 也被禁止了。



##### 性能下降

 JavaScript 引擎会在编译阶段进行数项的性能优化。其中有些优化依赖于能够根据代码的词法进行**静态分析**，并预先确定所有变量和函数的定义位置，才能在执行过程中快速找到标识符。

但如果引擎在代码中发现了 with，它只能简单地假设关于标识符位置的判断都是无效的，因为无法知道传递给 with 用来创建新词法作用域的对象的内容到底是什么。

最悲观的情况是如果出现了 with ，所有的优化都可能是无意义的。因此引擎会采取最简单的做法就是完全不做任何优化。如果代码大量使用 with 或者 eval()，那么运行起来一定会变得非常慢。无论引擎多聪明，试图将这些悲观情况的副作用限制在最小范围内，也无法避免如果没有这些优化，代码会运行得更慢的事实。

