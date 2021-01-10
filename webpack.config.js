const path = require('path');
const globby = require('globby');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  entry:
    globby.sync([
      './src/scripts/layout/*.js',
      './src/scripts/templates/**/*.js'
    ]).reduce((acc, path) => {
      const entry = path.replace(/^.*[\\\/]/, '').replace('.js','');
      acc[entry] = path;
      return acc;
  }, {}),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
    ]
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/**/*',
          to: '[folder]/[name].[ext]',
          globOptions: {
            ignore: [
              '**/assets',
              '**/scripts',
              '**/styles',
              '**/templates'
            ]
          }
        },
        {
          from: 'src/assets/**/*',
          to: 'assets/[name].[ext]',
          noErrorOnMissing: true
        },
        {
          from: 'src/templates',
          to: 'templates'
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css.liquid'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false
          }
        }
      })
    ]
  }
};

if (process.env.NODE_ENV == 'development') {
  module.exports.plugins.push(
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: [
          'echo Starting build...'
        ]
      },
      onBuildEnd: {
        scripts: [
          'echo Deploying theme...',
          'shopify-themekit deploy'
        ],
        blocking: true
      },
      onBuildExit: {
        scripts: [
          'echo Starting server...',
          'shopify-themekit watch --notify=.theme.update',
          () => {
            const os = require('os');
            const fs = require('fs');
            const yaml = require('js-yaml');
            const config = yaml.load(fs.readFileSync('config.yml', 'UTF8'));
            const store = config.development.store;
            const options = '/?_fd=0&pb=0&preview_theme_id=';
            const theme_id = config.development.theme_id;
            const browserSync = require('browser-sync');
            setTimeout(() => {
              browserSync({
                files: '.theme.update',
                proxy: 'https://' + store + options + theme_id,
                https: {
                  key: path.resolve(os.homedir(), '.localhost_ssl/server.key'),
                  cert: path.resolve(os.homedir(), '.localhost_ssl/server.crt')
                },
                notify: false,
                snippetOptions: {
                  rule: {
                    match: /<\/body>/i,
                    fn: (snippet, match) => {
                      return snippet + match;
                    }
                  }
                }
              });
            }, 3500);
          }
        ],
        parallel: true
      }
    })
  )
};
