## 打包后代码行列数是改变了，需要sourcemap, 还得引入
import sourceMap from 'source-map'
sourceMap.SourceMapConsumer.initialize({
  "lib/mappings.wasm": "htpps://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
})