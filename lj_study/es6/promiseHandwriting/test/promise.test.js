const Promise = require('../code/promise')
new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve(123)
    },1000)
}).then(res=>{
    console.log('res',res);
    return new Promise(resolve=>{
        resolve(12)
    })
},(err)=>{
    console.log(err);
}).then(res=>{
    console.log(res);
})
