import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import path from "path";
import ejs from "ejs";
import * as babel from "babel-core";
import { jsonLoader } from "./loaders/jsonLoader.js";
import { changeOutputPath } from "./plugins/changeOutputPath.js";
import { SyncHook } from "tapable";
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader],
      },
    ],
  },
  plugins: [new changeOutputPath()],
};
const hooks = {
  emitFile: new SyncHook(["context"]),
};
let id = 0;
function createAssets(filePath) {
  // 获取文件相互依赖关系
  // ast 抽象语法树
  let source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
  // 对非js文件进行转换
  const loaders = webpackConfig.module.rules;
  const loaderContext = {
    addDeps(dep) {
      console.log("addDeps", dep);
    },
  };
  loaders.forEach(({ test, use }) => {
    if (use instanceof Array) {
    //   console.log(use);
      use.reverse().forEach((fn) => {
        if (test.test(filePath)) {
          source = fn.call(loaderContext, source);
          // console.log(source)
        }
      });
    }
  });
  //   console.log(loaders)
  //   return
  const ast = parser.parse(source, {
    sourceType: "module",
  });
  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      // console.log(node.source.value)
      deps.push(node.source.value);
    },
  });
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["env"],
  });
  //   console.log(code);
  return {
    filePath,
    code,
    deps,
    id: id++,
    mapping: {},
  };
}

function createGraph() {
  const mainAssets = createAssets("./example/main.js");
  let queue = [mainAssets];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAssets(path.resolve("example", relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }
  return queue;
}
function initPlugins() {
    webpackConfig.plugins.forEach(plugin => {
        plugin.apply(hooks)
    })
}
initPlugins()
const graph = createGraph();
// console.log(graph);
function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", {
    encoding: "utf-8",
  });
  const data = graph.map((asset) => {
    const { code, id, mapping } = asset;
    return {
      code,
      id,
      mapping,
    };
  });
  //   console.log(data);
  const code = ejs.render(template, { data });
  let outputPath = "./dist/bundle.js"
  //   创建可更改打包文件路径插件
  const context = {
    changeOutputPath(pathFile) {
        // console.log(path)
        outputPath = pathFile
    }
  }
  hooks.emitFile.call(context);
  fs.writeFileSync(outputPath, code);
}
build(graph);
