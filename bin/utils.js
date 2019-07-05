const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');
const path = require('path');
const fs = require('fs');
const del = require('del');
const selfsigned = require('selfsigned');
const currPath = __dirname.replace('/ft-runner/bin', '');

exports.getHttpsConfig = () => {
    // Use a self-signed certificate if no certificate was configured.
    // Cycle certs every 24 hours
  
    const certPath = path.join(currPath, 'webpack-dev-server/ssl/', 'server.pem');
    let certExists = fs.existsSync(certPath);
  
    if (certExists) {
      const certStat = fs.statSync(certPath);
      const certTtl = 1000 * 60 * 60 * 24;
      const now = new Date();
  
      // cert is more than 30 days old, kill it with fire
      if ((now - certStat.ctime) / certTtl > 30) {
        // eslint-disable-next-line no-console
        console.info('SSL Certificate is more than 30 days old. Removing.');
        del.sync([certPath], { force: true });
        certExists = false;
      }
    }
  
    if (!certExists) {
      // eslint-disable-next-line no-console
      console.info('Generating SSL Certificate');
      const attrs = [{ name: 'commonName', value: 'localhost' }];
      console.log(1111, selfsigned.generate)
      const pems = selfsigned.generate(attrs, {
        algorithm: 'sha256',
        days: 30,
        keySize: 2048,
        extensions: [{
          name: 'basicConstraints',
          cA: true
        }, {
          name: 'keyUsage',
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true
        }, {
          name: 'subjectAltName',
          altNames: [
            {
              // type 2 is DNS
              type: 2,
              value: 'localhost'
            },
            {
              type: 2,
              value: 'localhost.localdomain'
            },
            {
              type: 2,
              value: 'lvh.me'
            },
            {
              type: 2,
              value: '*.lvh.me'
            },
            {
              type: 2,
              value: '[::1]'
            },
            {
              // type 7 is IP
              type: 7,
              ip: '127.0.0.1'
            },
            {
              type: 7,
              ip: 'fe80::1'
            }
          ]
        }]
      });

      fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
    }
    const fakeCert = fs.readFileSync(certPath);
  
    return {
      key: fakeCert,
      cert: fakeCert,
      ca: fakeCert
    };
  };


//babelLoader
exports.getBabelLoaderConfig = () => {
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
exports.getStyleLoaders = (isInJs, cssOptions, preProcessor) => {
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
