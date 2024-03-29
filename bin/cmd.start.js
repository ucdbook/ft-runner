#!/usr/bin/env node

const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');
const projectConfig = require('./webpack.start.js');
const chalk = require('chalk');

const compiler = Webpack(projectConfig);
const server = new WebpackDevServer(compiler, projectConfig.devServer);

server.listen(projectConfig.devServer.port, '0.0.0.0', () => {
    console.log('');
    console.log(chalk.green('server start =', `http://127.0.0.1:${projectConfig.devServer.port}`));
    console.log('');
});