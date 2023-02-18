export class changeOutputPath {
    apply(hooks) {
        hooks.emitFile.tap('changeOutputPath', (context) => {
            console.log(context)
            context.changeOutputPath('./dist/test.js')
        })
    }
}