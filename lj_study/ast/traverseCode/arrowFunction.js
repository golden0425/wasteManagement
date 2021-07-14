// babel babel-plugin-arrow-function  
// 将es6箭头函数转换成es5的函数

// 直接用babel编译
// babel-core 转换
// 改ast, babel-types
const babelCore = require('babel-core')
const babelTyeps = require('babel-types') // 1：生成Ast 判断是不是代码块 
let code = `
    let sum = (a,b) => a+b
`
// .babelrc
let ArrowPlugin = {
    visitor:{
        // path 就是树的路径
        ArrowFunctionExpression(path){
            let node = path.node
            // 生成一个函数表达式
            let params = node.params
            let body = node.body
            if(!babelTyeps.isBlockStatement(body)){
                // 不是代码块
                const returnStatement = babelTyeps.returnStatement(body)
                body = babelTyeps.blockStatement([
                    returnStatement
                ])
            }
            const newCode = babelTyeps.functionExpression(null,params,body,false,false)
            path.replaceWith(newCode)
        }
    }
}
const r = babelCore.transform(code,{
    plugins:[
        ArrowPlugin
    ]
})
console.log(r.code);
