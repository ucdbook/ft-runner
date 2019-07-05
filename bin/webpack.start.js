const path = require('path');
const fs = require("fs");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const lessLoader = require.resolve('less-loader');
const webpack = require('webpack');
const {
  getStyleLoaders,
  getBabelLoaderConfig,
  getHttpsConfig
} = require('./utils');
const projectRoot = process.cwd();
const myRoot = __dirname.replace('/bin', '');
const configJson = require(path.resolve(projectRoot, 'abc.json'));

let name = 'index';
let isMini = process.env.npm_lifecycle_event === 'mini' ? true : false;
let entryName = isMini ? `${name}.min` : `${name}`;

const lessVariables = {};


module.exports = {
    mode: 'development',

    entry: {
        [entryName]: path.resolve(myRoot, './index.tsx')
    },

    devtool: 'source-map',

    output: {
        path: path.resolve(myRoot, './dist'),
        filename: '[name].js',
        library: 'TfLogin',
        libraryTarget: 'umd'
    },

    devServer: {
        contentBase: path.resolve(myRoot, './dist'),
        // host: 'localhost',      // 默认是localhost
        port: configJson.port || 2225,             // 端口
        open: true,             // 自动打开浏览器
        hot: true,               // 开启热更新
        disableHostCheck: true,
        proxy: configJson.proxy,
        //https: configJson.https ? getHttpsConfig() : {},
        //clientLogLevel: 'warning',
    },

    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json'],
    },

    optimization: {
        minimizer: [
          new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true 
          }),
          new OptimizeCSSAssetsPlugin({})  // use OptimizeCSSAssetsPlugin
        ]
    },

    //externals: [nodeExternals()], //  忽略node_modules文件夹中的所有模块

    module: {
        rules: [
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
                loader: require.resolve('url-loader'),
                options: {
                  limit: 10000,
                  name: '[name].[ext]',
                },
            },
            {
                test: /\.(ts|tsx|js|jsx|mjs)$/,
                //exclude: /node_modules/,
                use: [
                  getBabelLoaderConfig(),
                ],
            },
            {
                test: /\.css$/, // 解析css
                include: [projectRoot, path.join(myRoot, 'src')], 
                use: getStyleLoaders(true, {
                    importLoaders: 1,
                }),
            },
            {
                test: /\.less$/, // 解析less
                include: [projectRoot, path.join(myRoot, 'src')], 
                use: getStyleLoaders(true,
                    {
                      importLoaders: 1,
                    },
                    {
                      loader: lessLoader,
                      options: {
                        javascriptEnabled: true,
                        modifyVars: lessVariables,
                      },
                    }
                ),
            }
        ]
    },

    plugins: [
      new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: "[name].css",
          chunkFilename: "[id].css"
      }),
        new HtmlWebPackPlugin({
            template: path.resolve(myRoot, './index.html'),
            filename: path.resolve(myRoot, './dist/index.html'),
            hash: true, // 会在打包好的bundle.js后面加上类似于: ?6ce91c19b9054fff5a05 串
        }),

        new webpack.DefinePlugin({
          'PROJECTROOT': `'${projectRoot}'`
        }),

        new webpack.HotModuleReplacementPlugin()

        
    ]
};

