const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    generateReport:'./functions/generate-report.js', // Entry point for your additional JavaScript file
    sorting:'./functions/sorting.js',
    defaulters:'./functions/defaulters.js',
    evaluation:'./functions/evaluation.js',
    routing:'./functions/routing.js',
    dateCategorization:'./functions/dateCategorization.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // Use [name] placeholder to output files with different names
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Path to your HTML template file
      filename: 'index.html', // Name of the output HTML file
          }),
    new HtmlWebpackPlugin({
      template: './report.html',
      filename: 'report.html',
    }),
  ],
  resolve: {
    fallback: {
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify/"),
      "os": require.resolve("os-browserify/browser"),
      "http": require.resolve("stream-http"),
      "querystring": require.resolve("querystring-es3"),
      "vm": require.resolve("vm-browserify"),
      "zlib": require.resolve("browserify-zlib"),
          }
  },
  target: 'node' // Set webpack target to 'node'
};
