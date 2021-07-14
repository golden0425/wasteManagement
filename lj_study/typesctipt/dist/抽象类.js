"use strict";
var Animal = /** @class */ (function () {
    function Animal() {
    }
    Animal.prototype.speak = function () {
        console.log("汪汪...");
    };
    return Animal;
}());
var Dog = /** @class */ (function () {
    function Dog() {
    }
    Dog.prototype.speak = function () {
        throw new Error("Method not implemented.");
    };
    return Dog;
}());
