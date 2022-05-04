const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: './src/index.js',
  context: process.cwd(),
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'), // 静态文件根目录

  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
      scriptLoading: "blocking" // 不能设为defer,否则无法监测到资源加载错误，同时addEventListener(()=>{}, true)要设置捕获阶段才能捕获
    })
  ]
}