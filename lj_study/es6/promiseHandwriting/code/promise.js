function resolvePromise(promise2,result,resolve,reject){
    // 判断result是不是promise
    // 规范中我们的promise和别人的promise进行交互
    if(promise2 === result){ // 不能自己等待自己完成
        return reject(new TypeError('循环引用'))
    }
    // x不等于null 或者result是对象或者是函数
    if(result!==null && (typeof result === 'object' || typeof result === 'function')){
        try { // 防止取then异常
            let then = result.then; // 取出result.then方法
            if(typeof then === 'function'){ // 如果then是函数我就认为是一个promise
                then.call(result,success=>{
                    // 如果success又是一个promise进行递归
                    resolvePromise(promise2,success,resolve,reject)
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
        resolve(result) // x 就是一个普通值
    }
}
class Promise{
    constructor(executor){
        // 三个状态(pending,fulfilled,rejected)
        this.status = 'pending' // 默认状态是等待的状态
        this.value = undefined // 成功默认值
        this.reason = undefined // 失败默认值
        // 存放成功的回调
        this.onResolvedCallbacks = []
        // 存放失败的回调
        this.onRejectedCallbacks = []
        // 只有为pendding的时候才可以进行赋值，并别更改状态，
        // 如果成功状态将状态更改为resolved,失败的时候将状态更改为rejected
        let resolve = (value) => {
            if(this.status === 'pending'){
                this.value = value
                this.status = 'resolved'
                this.onResolvedCallbacks.forEach(fn=>fn())
            }
        }
        let reject = (reason) => {
            if(this.status === 'pending'){
                this.reason = reason
                this.status = 'rejected'
                this.onResolvedCallbacks.forEach(fn=>fn())
            }
        }
        // 执行的时候可能会出现错误，
        try {
            executor(resolve,reject)
        } catch (error) {
            reject(error)
        }
    }
    then(onFullFilled,onRejected){
        let promise2;
        if(this.status === 'resolved'){
            promise2 = new Promise((resolve,reject)=>{
                const reuslt = onFullFilled(this.value)
                // 看 onFullFilled 调用返回的结果是不是promise如果是promise作为下一次then的调用
                // 如果是个普通值作为promise2的成功返回的结果
                // resolvePromise解析promise2和result之间的关系
                resolvePromise(promise2,reuslt,resolve,reject)
            })
        }
        if(this.status === 'rejected'){
            promise2 = new Promise((resolve,reject)=>{
                const reuslt = onFullFilled(this.value)
                resolvePromise(promise2,reuslt,resolve,reject)
            })
        }
        if(this.status === 'pending'){
            promise2 = new Promise((resolve,reject)=>{

                // 存放成功的回调
                this.onResolvedCallbacks.push(()=>{
                    const reuslt = onFullFilled(this.value)
                    resolvePromise(promise2,reuslt,resolve,reject)
                })
                // 存放失败的回调
                this.onRejectedCallbacks.push(()=>{
                    const reuslt = onRejected(this.reason)
                    resolvePromise(promise2,reuslt,resolve,reject)
                })
            })
        }
        // 调用then之后又返回一个新的promise
        return promise2
    }
}
module.exports = Promise