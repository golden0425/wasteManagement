"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// 装饰器
// 装饰类的时候参数就是那个构造函数
function addNameFactory(name) {
    return function (constructor) {
        constructor.prototype.name = name;
        constructor.prototype.eat = function () {
            console.log("吃");
        };
    };
}
var Person = /** @class */ (function () {
    function Person() {
    }
    Person = __decorate([
        addNameFactory('zs')
    ], Person);
    return Person;
}());
var per = new Person();
console.log(per.name);
console.log(per.eat());
