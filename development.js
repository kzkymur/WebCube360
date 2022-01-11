import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin';

const src  = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')

export default {
  mode: 'development',
  entry: src + '/index.jsx',

  output: {
    path: dist,
    filename: 'bundle.js'
  },

  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(v|f)s$/,
        loaders: 'raw-loader',
      },
      {
        test: /\.(jpg|png|mp4|zif)$/,
        loaders: 'file-loader',
      },
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: { '@': src, }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: src + '/index.html',
      filename: 'index.html',
    })
  ],
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true, 
  }
}
