// 1: 函数返回一个函数
// 类型判断
// function isType(type,content){
//     // \[object\s|\] 前面的不要或者后面的不要
//     const t = Object.prototype.toString.call(content).replace(/\[object\s|\]/g,'')
//     return t === type
// }

// 柯里化，预先处理的值
// function isType(type) { 
//     return (content)=>{
//         const t = Object.prototype.toString.call(content).replace(/\[object\s|\]/g,'') 
//         return t === type;
//     }
// }
// const isString = isType('String')
// const isStr = isString('content');
// console.log(isStr);


// 预设一些值，自动生成一些方法
// const types = ['String','Number','Null','Array','Object']
// function isType(type) { 
//     return (content)=>{
//         const t = Object.prototype.toString.call(content).replace(/\[object\s|\]/g,'') 
//         return t === type;
//     }
// }
// const typeUtils = {}
// types.forEach(type=>{
//     typeUtils['is'+type] = isType(type)
// })
// console.log(typeUtils.isString('123'));


// 2：函数当做参数传递，callback
// loadsh after 
// 吃饭一个函数，调用三次之后 再执行另一个函数
// const after = (times,callback)=>{
//     return ()=>{
//         if(--times === 0){
//             callback()
//         }
//     }
// }
// const eat = after(3,()=>{
//     console.log("吃饭");
// })
// eat()
// eat()
// eat()


