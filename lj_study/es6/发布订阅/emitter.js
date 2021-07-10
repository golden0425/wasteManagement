class Emitter{
    constructor(){
        this.emmiter = {}
    }
    // 收集
    on(eventName,callback){
        if(this.emmiter[eventName]){
            this.emmiter[eventName].push(callback)
        }else{
            this.emmiter[eventName] = [callback]
        }
    }
    // 发布
    emit(eventName,...params){
        if(this.emmiter[eventName]){
            this.emmiter[eventName].forEach(fn=>{
                fn&&fn(...params)
            })
        }
    }
}

const emmiter = new Emitter()
//订阅
emmiter.on('a',(a,b)=>{
    console.log(a,b);
})
// 发布
emmiter.emit('a',123,456)
