function resolvePromise(promise,result,resolve,reject){
    if(promise === result){
        return reject(new TypeError('循环引用'))
    }
    if(result!==null && (typeof result === 'object' || typeof result === 'function')){
        try {
            let then = result.then;
            if(typeof then === 'function'){ // 如果then是函数我就认为是一个promise
                then.call(result,success=>{
                    // 如果success又是一个promise进行递归
                    resolvePromise(promise,success,resolve,reject)
                },error=>{
                    reject(error)
                })
            }else{
                // then是一个普通对象，直接成功即可
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    }else{
        resolve(result) // result 就是一个普通值
    }
}
class Promise{
    constructor(executor){
        this.status = 'pending'
        this.value = undefined
        this.reason = undefined
        // 存放成功的回调
        this.onResolvedCallbacks = []
        // 存放失败的回调
        this.onRejectedCallbacks = []
        const resolve = (value) =>{
            if(this.status === 'pending'){
                this.status = 'resolved'
                this.value = value
                this.onResolvedCallbacks.forEach(fn=>fn())
            }
        }
        const reject = (reason) =>{
            if(this.status === 'pending'){
                this.status = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn=>fn())
            }
        }
        try {
            executor(resolve,reject)
        } catch (error) {
            reject(error)
        }
    }
    then(onFullFilled,onRejected){
        let promise;
        if(this.status === 'resolved'){
            promise = new Promise((resolve,reject)=>{
                const result = onFullFilled(this.value)
                resolvePromise(promise,result,resolve,reject)
            })
        }
        if(this.status === 'rejected'){
            promise = new Promise((resolve,reject)=>{
                const result = onRejected(this.reason)
                resolvePromise(promise,result,resolve,reject)
            })
        }
        if(this.status === 'pending'){
            promise = new Promise((resolve,reject)=>{
                this.onResolvedCallbacks.push(()=>{
                    const result = onFullFilled(this.value)
                    resolvePromise(promise,result,resolve,reject)
                })
                this.onRejectedCallbacks.push(()=>{
                    const result = onRejected(this.value)
                    resolvePromise(promise,result,resolve,reject)
                })
            })
        }
        return promise
    }
}

module.exports = Promise 