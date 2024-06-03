const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main:'./functions/generate-report.js', // Entry point for your additional JavaScript file
    report:'./report-scripts.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js', // Use [name] placeholder to output files with different names
  },
  
  output:{
    path: path.resolve(__dirname,'dist'),
    filename: '[name].bundle.js',
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
      {
        test: /\.css$/, //process css files
        use: ['style-loader','css-loader']
      },
      {
        test:/\.html$/, //process HTML files
        use:'html-loader',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Path to your HTML template file
      filename: 'index.html', // Name of the output HTML file
      chunks:['main'], // Include main javascript file
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      template: './report.html',
      filename: 'report.html',
      chunks:['report'], // Include report javascript file
      inject: 'body',
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
      "style-loader": require.resolve("style-loader"),
      "css-loader": require.resolve("css-loader"),
      "html-loader": require.resolve("html-loader"),
    }
  },
  target: 'node' // Set webpack target to 'node'
};
