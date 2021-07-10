// 生成器
let obj = {0:1,1:2,2:3,length:3,[Symbol.iterator]:function *(){
    // 生成器返回一个的是一个迭代器
    let index = 0    
    while(index !== this.length){
        yield this[index++] // 自动迭代，每次都会不停调用next方法，把yeild的结果作为值
    }
}}

function arg(){
    const res = [...obj]
    console.log(res);
}
arg()
