
import Logger from './tools/logger'
import Shell from './tools/shell'
import Spinner from './tools/spinner'
import Util from './tools/util'

import inquirer, { DistinctQuestion } from 'inquirer'
import PromptWrappedFunction from '../types/prompt-wrapped-function'
import CommandLineOptions from '../types/command-line-options'
import RuntimeState from '../types/runtime-state'
import GlobalConfig from '../types/global-config'

import { Branching } from '../task/branching'
import Git from './tools/git'

// this class provides an instance of the various
// tools that are employed by the working tracts
// These aren't specific to any one work item, but are shared by all.

export class ToolBoxClass {

  readonly global:GlobalConfig         = new GlobalConfig({})
  readonly options:CommandLineOptions  = new CommandLineOptions({})
  readonly state:RuntimeState          = new RuntimeState({})

  readonly log:Logger
  readonly shell:Shell
  readonly spinner:Spinner
  readonly util:Util
  readonly git:Git

  branching = new Branching()

  constructor( global:Partial<GlobalConfig> = {},options:Partial<CommandLineOptions>={} )
  {
    this.global.reset(global)
    this.options.reset(options)

    // these must happen during constructor, not during object definition
    // or you'll get a circular dependency.
    this.log      = new Logger()
    this.shell    = new Shell(this.log)
    this.spinner  = new Spinner(this.options)
    this.util     = new Util()
    this.git      = new Git()


  }

  //--- these reset all options to default except any overrides
  resetOptions(input:Partial<CommandLineOptions>={}){
    this.options.reset(input)
  }
  resetState(input:Partial<RuntimeState>={}){
    this.state.reset(input)
  }
  //--- these apply the given values but leave other stuff alone
  setOptions(input:Partial<CommandLineOptions>){
    this.options.set(input)
  }
  setState(input:Partial<RuntimeState>){
    this.state.set(input)
  }

  async prompt(params:PromptWrappedFunction) {
    // show the prompt
    params.prompt.name = 'tempName'
    if(params.prompt.choiceMaker){
      params.prompt.choices = params.prompt.choiceMaker()
    }
    const answers = await inquirer.prompt([params.prompt]);

    // if it's a confirm, check it
    const doExecute = params.prompt.type === 'confirm' ? answers.tempName : true;

    // if confirmed, do the given task.
    return doExecute && params.task ? await params.task(answers.tempName) : false;

  }

  async step(params:PromptWrappedFunction) {
    const opts = Object.assign({}, this.options, params);
    return opts.isCI ? this.spinner.show(params) : this.prompt(params);
  }

}

const tb = new ToolBoxClass()

export default tb