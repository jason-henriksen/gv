import chalk from'chalk'

import t from '../toolbox'
class Logger {

  constructor() {
  }

  silentForTest:boolean = false

  log(...args) {
    if(!this.silentForTest){
      console.log(...args); // eslint-disable-line no-console
    }
  }

  error(...args) {
    if(!this.silentForTest){
      console.error(chalk.red('ERROR'), ...args); // eslint-disable-line no-console
    }
  }

  info(...args) {
    this.log(chalk.grey(...args));
  }

  obtrusive(...args) {
    this.log('\n',...args,'\n');
  }

  warn(...args) {
    this.log(chalk.yellow('WARNING'), ...args);
  }

  debug(...args) {
    if(t.options.isDebug){
      this.log(chalk.greenBright('DEBUG: '), ...args)
    }
  }

  verbose(...args) {
    if(t.options.isVerbose){
      this.log(chalk.cyan('VERBOSE: '), ...args)
    }
  }

}

export default Logger
