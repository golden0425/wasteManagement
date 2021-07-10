const fs = require('fs')
const path = require('path')

const after = (timer,callback)=>{
    const arr = []
    return (d)=>{
        arr.push(d)
        if(arr.length === timer){
            callback(arr)
        }
    }
}

const out = after(2,(data)=>{
    console.log(data);
})

fs.readFile(path.resolve(__dirname,'a.txt'),'utf-8',(err,data)=>{
    out(data)
})
fs.readFile(path.resolve(__dirname,'b.txt'),'utf-8',(err,data)=>{
    out(data)
})
