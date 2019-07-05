var path = require('path');
var fs = require("fs");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const lessLoader = require.resolve('less-loader');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const projectRoot = process.cwd();
const myRoot = __dirname.replace('/bin', '');
console.log(2222222222222222222, myRoot)

let name = 'index';
let isMini = process.env.npm_lifecycle_event === 'mini' ? true : false;
let entryName = isMini ? `${name}.min` : `${name}`;

const lessVariables = {};

//babelLoader
const getBabelLoaderConfig = () => {
    return {
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: {
                browsers: ["> 1%", "IE 10"],
              },
              modules: false,
              useBuiltIns: 'entry',
            }
          ],
          require.resolve('@babel/preset-typescript'),
          require.resolve('@babel/preset-react'),
        ],
        plugins: [
          require.resolve('@babel/plugin-syntax-dynamic-import'),
          [ require.resolve('@babel/plugin-proposal-decorators'), { legacy: true } ],
          [ require.resolve('@babel/plugin-proposal-class-properties'), { loose: true } ],
        ].concat(
          []
        ),
        cacheDirectory: true,
        compact: true,
        highlightCode: true,
      },
    };
};

//styleLoaders
const getStyleLoaders = (isInJs, cssOptions, preProcessor) => {
    const loaders = [
        isInJs ?
        MiniCssExtractPlugin.loader : require.resolve('style-loader'),
      {
        loader: cssOptions.modules ? require.resolve('typings-for-css-modules-loader') : require.resolve('css-loader'),
        //options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () => [
            //require('postcss-flexbugs-fixes'),
            autoprefixer({
              flexbox: 'no-2009',
            }),
          ],
        },
      },
    ];
    if (preProcessor) {
      loaders.push(preProcessor);
    }
    return loaders;
};

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
        port: 2225,             // 端口
        open: true,             // 自动打开浏览器
        hot: true,               // 开启热更新
        disableHostCheck: true
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
}

