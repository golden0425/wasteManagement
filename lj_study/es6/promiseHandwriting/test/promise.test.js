// const Promise = require('../code/promise')
// new Promise((resolve,reject)=>{
//     setTimeout(()=>{
//         resolve(123)
//     },1000)
// }).then(res=>{
//     console.log('res',res);
//     return new Promise(resolve=>{
//         resolve(12)
//     })
// },(err)=>{
//     console.log(err);
// }).then(res=>{
//     console.log(res);
// })



// test Promise
const Promise = require('../code/promise1')
new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(124)
    },1000)
}).then(res=>{
    return new Promise(resolve=>{
        resolve('123')
    })
}).then(res=>{
    console.log(res);
})