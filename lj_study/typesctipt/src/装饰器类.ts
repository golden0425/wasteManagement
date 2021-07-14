// namespace a{

//     function replaceClass(constructor:Function){
//         return class{
//             name!:string;
//             age!:string;
//             eat(){
//                 return '吃'
//             }
//         }
//     }

//     @replaceClass
//     class X{
//         name!:string;
//         age!:string
//         constructor(){}
//     }
//     let x = new X()
//     console.log(x.age);
//     console.log(x.name);
// }

// namespace b{
//     function upperCase(target:any,propertyKey:string){
//         let value:string = target[propertyKey]
//         Object.defineProperty(target,propertyKey,{
//             get:()=>{
//                 return value
//             },
//             set:(newValue:string)=>{
//                 value = newValue.toUpperCase()
//             }
//         })
//     }

//     class Person{
//         @upperCase
//         name:string='ls'
//     }
//     const per = new Person();
//     console.log(per.name);
// }


// 装饰器类方法
namespace b{
    function getName(target:Function){
        target.prototype.name = 123;
        target.prototype.eat = ()=>{
            return '吃饭'
        };
    }
    @getName
    class Person{
        name!:string;
        eat!:()=>void;
        constructor(){}
    }
    const per = new Person();
    console.log(per.name);
    console.log(per.eat());
}