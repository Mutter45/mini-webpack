(function (modules) {
    function require(id) {
        const [fn, mapping] = modules[id];
        const module = {
          exports: {},
        };
        function localRequire(filePath) {
          const id = mapping[filePath]
          return require(id)
        }
        fn(localRequire, module, module.exports);
    
        return module.exports;
      }
      require(0);
  })({
    
          0 : [function (require, module, exports) {
      "use strict";

var _foo = require("./src/foo.js");

var _test = require("./src/test.json");

var _test2 = _interopRequireDefault(_test);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// foo();
console.log(_test2.default);
console.log("main.js"); },
      {"./src/foo.js":1,"./src/test.json":2}],
    
          1 : [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foo = foo;

function foo() {
  console.log('foo.js');
} },
      {}],
    
          2 : [function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\r\n    \"name\":\"lisa\",\r\n    \"age\":18\r\n}"; },
      {}],
     
    
  
  });
  