
import isCICDServer from 'is-ci';

// command line options
class CommandLineOptions {
  readonly isDryRun?:boolean=false
  readonly isCI?:boolean=isCICDServer
  readonly isVerbose?:boolean=false
  readonly isDebug?:boolean=false
  readonly verbosityLevel?:number=0
  readonly ignoreVersion?:boolean=false
  readonly write?:boolean=false
  readonly external?:boolean=false
  readonly publish?:boolean=false // if false, publishing will be blocked
  readonly skipChecks?:boolean=false

  readonly jiraId?:string='' // jira name on branch
  readonly jiraText?:string='' // ?? feature/bugname of branch?

  constructor( values: Partial<CommandLineOptions>={})
  {
    Object.assign(this,values)
  }

  set(values:Partial<CommandLineOptions>={}){
    Object.assign(this,values)
  }

  reset(values:Partial<CommandLineOptions>={}){
    Object.assign(this,new CommandLineOptions({}), values)
  }

}

export default CommandLineOptions