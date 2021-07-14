"use strict";
// namespace a{
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var b;
(function (b) {
    function getName(target) {
        target.prototype.name = 123;
        target.prototype.eat = function () {
            return '吃饭';
        };
    }
    var Person = /** @class */ (function () {
        function Person() {
        }
        Person = __decorate([
            getName
        ], Person);
        return Person;
    }());
    var per = new Person();
    console.log(per.name);
    console.log(per.eat());
})(b || (b = {}));
