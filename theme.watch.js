const themeKit = require('@shopify/themekit');
const browserSync = require('browser-sync');
const path = require('path');
const os = require('os');
const fs = require('fs');
const yargs = require('yargs');
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
const options = '/?_fd=0&pb=0&preview_theme_id=';

const { env = 'development' } = yargs(process.argv).argv;

themeKit.command('deploy', {
  env
}).then(() => {
  themeKit.command('watch', {
    env,
    notify: '.theme.update'
  });
}).then(() => {
  setTimeout(() => {
    browserSync({
      files: '.theme.update',
      proxy: env == 'staging'
        ? 'https://' + config.staging.store + options + config.staging.theme_id
        : 'https://' + config.development.store + options + config.development.theme_id,
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
  }, 3000);
});
