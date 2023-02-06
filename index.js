import fs from 'fs'
import parser from '@babel/parser'
function creatAssets() {
    // 获取文件相互依赖关系
    // ast 抽象语法树
    const source = fs.readFileSync('./example/main.js', {
        encoding:'utf-8'
    })
    const ast = parser.parse(source, {
        sourceType: "module",
    })
    console.log(ast)
    return {}
}
creatAssets()