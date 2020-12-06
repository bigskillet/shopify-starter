const path = require('path');
const yargs = require('yargs');

const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const { env = 'development' } = yargs(process.argv).argv;

module.exports = {
  entry: './src/scripts/application.js',
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'src/assets/application.js',
  },
  plugins: [
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
