// 发布用到的babel插件
// const prodPlugins = []
// if(process.env.NODE_ENV === 'production'){
//   prodPlugins.push('transform-remove-console')
// }

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // ...prodPlugins,
    'transform-remove-console',
    '@babel/plugin-syntax-dynamic-import'
  ]

}
