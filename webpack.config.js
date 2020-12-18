const path = require('path');
const yargs = require('yargs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const { env = 'development' } = yargs(process.argv).argv;

module.exports = {
  entry: './src/scripts/theme.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/theme.js',
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
          to: 'templates',
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/theme.css.liquid',
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
  ]
};
