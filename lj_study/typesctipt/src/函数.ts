// function func(name:string,num:number):string{
//     return name+num;
// }
// const resultStr = func('zs',123)
// console.log(resultStr);


// type GetName = (name:string,age:number)=>string
// const getName:GetName = function(name,age):string{
//         return name+age;
// }
// console.log(getName('12',12));


// function print(name:string,age?:number):string{
//     return age?name+age:age+''
// }
// console.log(print('123',1));


// 剩余参数
// function sum(...numbers:number[]):number{
//     return numbers.reduce((val,item)=>val + item,0)
// }
// const result = sum(1,2,3,4,5,6,7)
// console.log(result);


let obj:any = {}
// 函数的重载
function attr(val:string):void
function attr(val:number):void
// 以上两个定义的重载需要定义在实现之前，中间不能有其他代码
function attr(val:string|number):void{
    if(typeof val==='string'){
        obj.name = val
    }else{
        obj.age = val
    }
}
attr('zf')
attr(123)

