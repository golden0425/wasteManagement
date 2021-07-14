// let strArrTuple:[string,number] = ['1',1]
// console.log(strArrTuple);

// enum
// enum GrilType{
//     NAME ='zs',
//     AGE ='12'
// }
// console.log(GrilType.NAME);
// console.log(GrilType.AGE);


// 常量枚举
// const enum Colors {
//     RED,
//     BLUE,
//     GREEN
// }
// console.log(Colors.RED);
// console.log(Colors.BLUE);
// console.log(Colors.GREEN);


// 任意类型
// any
// let root:(HTMLDivElement|null) = document.querySelector("#root")
// // root! '!' 为非空断言
// root!.style.color = 'red' 
// // if(root){
//     // root.style.color = 'red'
// // }

// // null undefined 类型 其他类型的子类型
// let x:(number|undefined|null);
// x = undefined
// x = null


// never类型
// function n(){}
// const n1 = n()
// console.log(n1); // 默认返回undefined
// // nerver
// function nerverReturnFunc():never{
//     throw 'error'
// }
// const result = nerverReturnFunc();
// console.log("result",result);

// const symbol = Symbol('key')
// console.log(symbol);
// const arr:[] = []
// console.log(arr.toString());

// const bigInt = Number.MAX_SAFE_INTEGER


// 类型推导
// let a = '213'


// 包装对象  warpper Object
// 原始类型 对象类型
// 原始类型 string 
// let name1 = 'abc';
// 如果要调用 内部 自动包装成对象类型
// console.log(name1.toLocaleUpperCase());
// 过程
// new String(name).toLocaleUpperCase()


// 联合类型
// let names:string|number = 123
// // 双重断言 先转成any再转换成number
// console.log((names as any as number).toFixed(2)); 

// // 字面量类型和类型字面量
// // 字面量类型
// const up:'Up' = 'Up' // 一个字符串就是一个类型
// const down:'Down' = "Down"
// console.log(up);
// console.log(down);

