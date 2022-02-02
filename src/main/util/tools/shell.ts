import sh from 'shelljs'
// import execa from 'execa'

import Logger from './logger'
import t from '../toolbox'

const noop = Promise.resolve();

class Shell {

  log:Logger

  constructor(logVal:Logger) {
    sh.config.silent = true
    this.log = logVal
  }

  beLoud(){
    sh.config.silent = false
  }

  beSilent(){
    sh.config.silent = true
  }

  // put a spinner around a piece of work
  async execVerbose(cmd:string ) : Promise<any> {
    // const task = async () => {
    //   return await this.exec(cmd);
    // }
    return await t.spinner.show({
      task: async () => {
        return this.exec(cmd);
      },
      label: cmd, external:true })
  }

  async exec(command:string) : Promise<any> {
    if (!command) return;

    return new Promise((resolve, reject) => {
      sh.exec(command, { async: true }, (code, stdout, stderr) => {
        stdout = stdout.toString().trim();
        this.log.verbose(stdout);
        if (code === 0) {
          resolve(stdout);
        } else {
          // if(!sh.config.silent){
          //   this.log.log(`\n${stdout}`);
          //   this.log.error(`\n${stderr}`);
          // }
          reject(new Error(stderr));
        }
      });
    });

  }



}

export default Shell;
