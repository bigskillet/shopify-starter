const path = require('path');
const globby = require('globby');
const yargs = require('yargs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const { env = 'development' } = yargs(process.argv).argv;

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
          to: 'assets/',
          flatten: true,
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
    new WebpackShellPluginNext({
      onBuildExit:{
        scripts: process.env.NODE_ENV == 'development'
          ? env == 'staging'
            ? ['node theme.watch.js --env=staging']
            : ['node theme.watch.js']
          : [],
        parallel: true
      }
    })
  ],
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
