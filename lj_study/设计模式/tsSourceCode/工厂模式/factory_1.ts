class Plant{
    constructor(public name:string){
        this.name = name
    }
    grow(){
        console.log("植物正在生长...");
    }
}

class Apple extends Plant{
    constructor(public name:string, public flavour:string){
        super(name)
        this.flavour = flavour
    }
}
class Orange extends Plant{
    constructor(public name:string, public flavour:string,public color:string){
        super(name)
        this.flavour = flavour
        this.color = color
    }
}
// 直接new 缺点
// 1：耦合 2：依赖具体的实现
class Factory{
    create(type:string){
        switch (type) {
            case 'apple':
                return new Apple('酸苹果','酸')
            case 'orange':
                return new Orange('酸橘子','酸','黄色')
            default:
                throw `not ${type} object`
        }
    }
}
const orange = new Factory().create('orange');
console.log(orange);