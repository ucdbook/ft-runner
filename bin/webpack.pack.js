var path = require('path');
var fs = require("fs");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const lessLoader = require.resolve('less-loader');
const autoprefixer = require('autoprefixer');
const projectRoot = process.cwd();
const configJs = require(path.resolve(projectRoot, 'abc.js'));
const package = require(path.resolve(projectRoot, 'package.json'));
const {
  getStyleLoaders,
  getBabelLoaderConfig
} = require('./utils');

// 可以避免把 node_modules 里面的依赖包引入打包文件
const nodeExternals = require('webpack-node-externals');

let name = 'index';
let isMini = process.env.npm_lifecycle_event === 'mini' ? true : false;
let entryName = isMini ? `${name}.min` : `${name}`;

const lessVariables = {};
let config = {
    mode: isMini ? 'production' : 'development',

    entry: {
        [entryName]: path.resolve(projectRoot, 'index.ts')
    },

    devtool: isMini ? '': 'source-map',

    output: {
        path: path.resolve(projectRoot, 'dist'),
        filename: '[name].js',
        library: package.name,
        libraryTarget: 'umd'
    },

    devServer: {
        historyApiFallback: true,
        inline: true
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

    externals: [nodeExternals()], //  忽略node_modules文件夹中的所有模块

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
                exclude: /node_modules/,
                use: [
                  getBabelLoaderConfig(),
                ],
            },
            {
                test: /\.css$/, // 解析css
                include: path.join(projectRoot), 
                use: getStyleLoaders(false, {
                    importLoaders: 1,
                }),
            },
            {
                test: /\.less$/, // 解析less
                include: path.join(projectRoot), 
                use: getStyleLoaders(false,
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
        /*new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        function(a,b) {
            const text = fs.readFileSync(path.join(projectRoot, 'src/index.less'), "utf-8");
            const lessFilePath = path.join(projectRoot, 'dist/index.less');
            fs.createWriteStream(lessFilePath);
            fs.writeFile(lessFilePath, text, function() {
                console.log('success copy less file');
            });
        }*/
    ]
}

config = configJs(config);

if(config.exportType === 'function') {
    config.entry = {
        [entryName]: path.resolve(projectRoot, 'index.js')
    }
    delete config.exportType;
}
module.exports = config;

