"use strict";
// function test(age:number,name:string):string{
//     return age+'name'
// }
// const res = test(12,'zs')
// console.log(res);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// 修饰符
/**
 * public
 * protected
 * private
*/
var Person = /** @class */ (function () {
    function Person(name, age) {
        this.weight = 13; // 私有 只能自己能访问
        this.name = name;
        this.age = age;
    }
    Person.prototype.getWeight = function () {
        return this.weight;
    };
    return Person;
}());
var Student = /** @class */ (function (_super) {
    __extends(Student, _super);
    function Student() {
        var _this = _super.call(this, 'zs', 12) || this;
        _this.idCard = 1231242;
        return _this;
    }
    Student.prototype.getInfo = function () {
        console.log(this.idCard + "__" + this.name + "__" + this.age);
        var res = _super.prototype.getWeight.call(this);
        console.log(res);
    };
    return Student;
}(Person));
var stu = new Student();
stu.getInfo();
