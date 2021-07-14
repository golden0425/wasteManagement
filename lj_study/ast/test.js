const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
let code =  `
    function ast(){}
`
const tree = esprima.parseScript(code)
estraverse.traverse(tree,{
    enter(node){
        console.log('enter',node.type);
        node.name = 'zs1'
    },
    leave(node){
        console.log('leave',node.type);
    }
})
const newCode = escodegen.generate(tree)
console.log(newCode);

