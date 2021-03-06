'use strict';

const path = require('path');
const DefinePlugin = require('webpack').DefinePlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');
const Workbox = require('workbox-webpack-plugin');

const multipage = require('./multipage.config.js');
const Module = require('./module.config.js');
const host = require('../config').host;

let entry = multipage.entry,
    plugins = multipage.plugins

module.exports = (mode) => {
  let isDev = mode !== 'production'
  return {
    entry: entry,
    mode: mode,
    output: {
      path: path.resolve(__dirname, '../dist/'),
      filename: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[chunkhash].js',
      publicPath: isDev ? host.devUrl : host.deployUrl
    },
    devServer: {
      open: true
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          commons: {
            name: 'common',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          },
          vendor: {
            name: "vendor",
            test: /node_modules/,
            priority: 10,
            enforce: true
          }
        }
      }
    },
    externals: {
      jquery: 'jQuery',
      $: 'jQuery',
      BMap: 'BMap',
      window: 'window'
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, '..'),
        '@pages': path.join(__dirname, '..', 'pages'),
        '@css': path.join(__dirname, '..', 'assets', 'css'),
        '@img': path.join(__dirname, '..', 'assets', 'imgs'),
        '@data': path.join(__dirname, '..', 'pages', 'data'),
        '@utils': path.join(__dirname, '..', 'pages', 'utils')
      }
    }, 
    module: Module(isDev),
    plugins: plugins.concat(
      [
        new DefinePlugin({
          "SERVICE_URL": isDev ? JSON.stringify(host.devUrl) : JSON.stringify(host.deployUrl)
        }),
        new MiniCssExtractPlugin({
          filename: 'assets/css/[name].[chunkhash].css'
        }),
        new CopywebpackPlugin([{
          from: path.join(__dirname, '../assets', 'lib'),
          to: path.join(__dirname, '../dist')
        }]),
        new Workbox.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          importWorkboxFrom: 'local'
        }),
        // new Workbox.InjectManifest({
        //   // importWorkboxFrom: 'local',
        //   importsDirectory: path.join(__dirname, '../dist'),
        //   swSrc: path.resolve(__dirname, '../dist/workbox-v3.6.3/workbox-sw.js'),
        //   swDest: path.resolve(__dirname, '../dist/service-worker.js')
        // })
      ]
    ),
    devtool: isDev ? 'cheap-module-eval-source-map' : 'cheap-module-source-map'
  }
}