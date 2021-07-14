"use strict";
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
var Plant = /** @class */ (function () {
    function Plant(name) {
        this.name = name;
        this.name = name;
    }
    Plant.prototype.grow = function () {
        console.log("植物正在生长...");
    };
    return Plant;
}());
var Apple = /** @class */ (function (_super) {
    __extends(Apple, _super);
    function Apple(name, flavour) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        _this.flavour = flavour;
        _this.flavour = flavour;
        return _this;
    }
    return Apple;
}(Plant));
var Orange = /** @class */ (function (_super) {
    __extends(Orange, _super);
    function Orange(name, flavour, color) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        _this.flavour = flavour;
        _this.color = color;
        _this.flavour = flavour;
        _this.color = color;
        return _this;
    }
    return Orange;
}(Plant));
// 直接new 缺点
// 1：耦合 2：依赖具体的实现
var Factory = /** @class */ (function () {
    function Factory() {
    }
    Factory.prototype.create = function (type) {
        switch (type) {
            case 'apple':
                return new Apple('酸苹果', '酸');
            case 'orange':
                return new Orange('酸橘子', '酸', '黄色');
            default:
                throw "not " + type + " object";
        }
    };
    return Factory;
}());
var orange = new Factory().create('orange');
console.log(orange);
