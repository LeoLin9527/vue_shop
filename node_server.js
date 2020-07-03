const express = require('express')
const compression = require('compression')
// const https = require('https')
// const fs = require('fs')

// const options = {
//   cert: fs.readFileSync('./full_chain.pem'),
//   key: fs.readFileSync('./private.key')
// }
// 创建web服务
const app = express()
// 服务器端gzip压缩
app.use(compression())
//指定静态资源访问目录
app.use(express.static(require('path').join(__dirname, 'dist')))

// 启动web服务器
app.listen(9999, () => {
  console.log('web server running at http://127.0.0.1:9999')
})

// https.createServer(options, app).listen(443)
