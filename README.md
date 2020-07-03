# vue-shop

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 项目优化策略
- 生成打包报告
```$xslt
vue-cli-service build --report
```
- 第三方库启用CDN
```$xslt
默认情况下import导入的依赖包最终会被打包合并到同一个文件中，导致单文件体积过大。
```
- 组件按需加载,路由懒加载
```$xslt
npm install --save-dev @babel/plugin-syntax-dynamic-import

# babel.config.js
{
    @babel/plugin-syntax-dynamic-import
}
```
- 首页内容定制
```$xslt
<title><%= htmlWebpackPlugin.options.isProd ? '' : 'dev - ' %>电商后台管理系统</title>
```
- 配置HTTPS服务
```$xslt
进入http://freesssl.cn/,并选择品牌
输入自己的有限并选择相关选项
验证DNS（在域名管理后台添加TXT记录）
验证通过之后，下载SSL证书（full_chain.pem公钥；private私钥）
```
- pm2管理应用
```$xslt
安装：npm i pm2 -g
启动：pm2 start 脚本(app.js) --name 自定义名称
查看：pm2 ls
重启：pm2 restart
停止：pm2 stop
删除：pm2 delete
```
