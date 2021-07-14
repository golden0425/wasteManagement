// function test(age:number,name:string):string{
//     return age+'name'
// }
// const res = test(12,'zs')
// console.log(res);

// 修饰符
/**
 * public
 * protected
 * private
*/
class Person{
    public name:string; // 公有
    protected age:number; // 供子类访问
    private weight:number = 13; // 私有 只能自己能访问
    constructor(name:string,age:number){
        this.name = name
        this.age = age
    }
    getWeight(){
        return this.weight
    }
}
class Student extends Person{
    private idCard:number
    constructor(){
        super('zs',12)
        this.idCard = 1231242
    }
    getInfo(){
        console.log(this.idCard+"__"+this.name+"__"+this.age);
        const res = super.getWeight()
        console.log(res);
    }
}
let stu = new Student()
stu.getInfo()