const path = require('path');
var FlowtypePlugin = require('flowtype-loader/plugin');

module.exports = {
  entry: './app.js',

  output: {
    path: path.resolve(__dirname, './destination'),
    filename: 'build.js'
  },

  watch: false,
  optimization:{
        minimize: false, // <---- disables uglify.
        // minimizer: [new UglifyJsPlugin()] if you want to customize it.
  }
  

  // module: {
  //   rules: [
  //     {test: /\.js$/, loader: 'flowtype-loader', enforce: 'pre', exclude: /node_modules/},
  //   ]
  // },
  // plugins: [
  //   new FlowtypePlugin()
  //   // new FlowtypePlugin({cwd: '/path/'})
  //   // new FlowtypePlugin({failOnError: true})
  // ]

  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       use: [
  //         {
  //           loader: 'flowtype-loader'
  //         }
  //       ]
  //     }
  //   ]
  // }
}
