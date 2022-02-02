import parseArgs from 'yargs-parser'
import CommandLineOptions from './types/command-line-options';
import t from './util/toolbox'

const aliases = {
  c: 'config',
  d: 'dry-run',
  h: 'help',
  i: 'increment',
  v: 'version',
  V: 'verbose',

  //-- gitflow
  t: 'task',
  n: 'name',
  j: 'jira',
  w: 'work'  // feature, release or bugfix
};

export const parseCliArguments = (args:string[]):any => {
  const options = parseArgs(args, {
    boolean: ['dry-run', 'ci','verbose'],
    alias: aliases,
    configuration: {
      'parse-numbers': false,
      'camel-case-expansion': false
    }
  });
  // if (options.V) {
  //   options.verbose = typeof options.V === 'boolean' ? options.V : false;
  //   delete options.V;
  // }

  return options;
};

export const main = async ()=>{

  t.log.log('Welcome to cc-flow')
  const parsedOptions = new CommandLineOptions( parseCliArguments(process.argv) as any )
  t.setOptions( parsedOptions )

  try{
    await t.git.init()
    await t.branching.init()

    const goalTask = await t.branching.startUI()

    await t.branching.doTask(goalTask)

    t.log.log(`🏁 Done (in ${Math.floor(process.uptime())}s.)`);
  }
  catch(err:any){
    t.log.error(err.message)
    t.log.log(`🚩 Completed with error (in ${Math.floor(process.uptime())}s.)`);
  }

}

export default main

