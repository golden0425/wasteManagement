//先绑定，再取值，柯里化
Function.prototype.Xbind = function(context,...params){
    return (...contentParmas)=>{
        console.log("contentParmas",[...params,...contentParmas]);
        this.call(context,...params.concat(contentParmas))        
    }
}