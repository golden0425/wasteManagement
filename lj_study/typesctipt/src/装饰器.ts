// 装饰器
// 装饰类的时候参数就是那个构造函数
function addNameFactory(name:string){
    return (constructor:Function)=>{
        constructor.prototype.name = name
        constructor.prototype.eat = function(){
            console.log("吃");
        }
    }
}
@addNameFactory('zs')
class Person{
    name!:string;
    eat!:Function;
    constructor(){}    
}
const per:Person = new Person();
console.log(per.name);
console.log(per.eat());
