import fs from 'fs'
import parser from '@babel/parser'
import traverse from "@babel/traverse";
import path from 'path';
import ejs from 'ejs'
import * as babel from 'babel-core';
// console.log(traverse)
let id = 0
function createAssets(filePath) {
    // 获取文件相互依赖关系
    // ast 抽象语法树
    const source = fs.readFileSync(filePath, {
        encoding:'utf-8'
    })
    const ast = parser.parse(source, {
        sourceType: "module",
    })
    const deps = []
    traverse.default(ast, {
        ImportDeclaration({ node }) {
            // console.log(node.source.value)
            deps.push(node.source.value)
        }
      });
      const { code } = babel.transformFromAst(ast, null, {
        presets:["env"]
      });
    console.log(code)
    return {
        filePath,
        code,
        deps,
        id: id++,
        mapping:{},
    }
}

function createGraph() {
    const mainAssets = createAssets('./example/main.js')
    let queue = [mainAssets]
    for(const asset of queue) {
        asset.deps.forEach(relativePath => { 
            const child = createAssets(path.resolve('example', relativePath))
            asset.mapping[relativePath] = child.id
            queue.push(child)
        });
    }
    return queue
}
const graph = createGraph()
// console.log(graph)
function build(graph) {
    const template = fs.readFileSync('./bundle.ejs', {
        encoding:'utf-8'
    })
    const data = graph.map(asset => {
        const { code, id, mapping } = asset
        return {
            code,
            id,
            mapping,
        }
    })
    console.log(data)
    
    const code = ejs.render(template, {data})
    fs.writeFileSync('./dist/bundle.js', code)
}
build(graph)