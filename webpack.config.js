const path = require('path');
const globby = require('globby');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  entry:
    globby.sync([
      './src/scripts/**/*.js',
      '!./src/scripts/sections/*.js'
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
      filename: 'assets/[name].css.liquid',
    }),
    process.env.NODE_ENV == 'development' &&
      new WebpackShellPluginNext({
        onBuildStart: {
          scripts: [
            'echo -- Starting build...',
            'shopify-themekit watch --notify=.theme.update',
          ],
          parallel: true,
        },
        onBuildEnd: {
          scripts: [
            'echo -- Build complete!',
            'echo -- Deploying theme...',
            'shopify-themekit deploy',
            'echo -- Deploy complete!'
          ],
          blocking: true
        },
        onBuildExit:{
          scripts: [
            'echo -- Starting server...',
            () => {
              const os = require('os');
              const fs = require('fs');
              const yaml = require('js-yaml');
              const config = yaml.load(fs.readFileSync('config.yml', 'UTF8'));
              const options = '/?_fd=0&pb=0&preview_theme_id=';
              const browserSync = require('browser-sync');

              browserSync({
                files: '.theme.update',
                proxy: 'https://' + config.development.store + options + config.development.theme_id,
                https: {
                  key: path.resolve(os.homedir(), '.localhost_ssl/server.key'),
                  cert: path.resolve(os.homedir(), '.localhost_ssl/server.crt')
                },
                reloadDelay: 1500,
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
            }
          ],
          parallel: true
        }
      })
  ].filter(Boolean),
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true
              }
            }
          ]
        }
      }),
      new TerserPlugin({
        extractComments: false
      })
    ]
  }
};
