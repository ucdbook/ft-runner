#!/usr/bin/env node
const Webpack = require('webpack');
const projectConfig = require('./webpack.pack.js');
const compiler = Webpack(projectConfig);
const chalk = require('chalk');
console.log(chalk.yellow('BUILD START --------->'));
compiler.run((err, stats) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      console.log(chalk.red('<---------- BUILD FAILED'));
      return false;
    }
    if (stats.hasErrors()) {
      console.log(stats.toString('minimal'));
      console.log(chalk.red('<---------- BUILD FAILED'));
      return false;
    }
    // eslint-disable-next-line no-console
    console.log('\n' + stats.toString({
      hash: false,
      chunks: false,
      children: false,
      cached: false,
      modules: false,
      colors: true,
    }));

    console.log(chalk.green('<---------- BUILD SUCCESS'));
  });
