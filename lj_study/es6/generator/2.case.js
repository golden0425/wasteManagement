
// 给对象添加一个迭代器功能，可以使他被迭代
// 这个函数返回后生成一个迭代器， 如果碰到yeild会暂停执行
// function * gen() {
//     let a = yield 1;
//     console.log(a);
//     let b = yield 2;
//     console.log(b);
//     let c = yield 3
//     console.log(c);
// }
// // 生成器返回的是个迭代器，迭代器有next方法：next方法返回的有next和done
// let it = gen()
// console.log(it.next()); // 第一次next是不能传值的，走到yeild就停止了
// console.log(it.next(100)); // 第二次调用的时候从let a开始走
// console.log(it.next(200));
// console.log(it.next(300));

// async+await === generator+co


let fs = require('fs')
let path = require('path')
let {promisify} = require('util')
const readFile = promisify(fs.readFile)
function * read(){
    let r = yield readFile(path.resolve(__dirname,'./test.txt'),'utf-8')
    return [r]
}
function co(it){
    return new Promise((resolve,reject)=>{
        function next(val){
            const {value,done} = it.next(val)
            console.log("value",value);
            if(done){
                return resolve(value)
            }
            Promise.resolve(value).then(data=>{
                next(data)
            })
        }
        next()
    })
}
co(read()).then(data=>{
    // console.log(data);
})
