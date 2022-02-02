
// global config file options
// These were originally in a config file,
// but for our use they should effectively never change

export enum GitStyle {
  any = "any",
  git = "git",
  github = "github"
}
class GlobalConfig{
  requireBranch?:boolean=false
  requireBranchList?:Array<string>=[]
  requireCleanWorkingDir?:boolean=true
  requireUpstream?:boolean=true
  requireCommits?:boolean=false
  gitStyle:GitStyle = GitStyle.any

  constructor( values: Partial<GlobalConfig>={})
  {
    Object.assign(this,values)
  }

  set(values:Partial<GlobalConfig>={}){
    Object.assign(this,values)
  }

  reset(values:Partial<GlobalConfig>={}){
    Object.assign(this,new GlobalConfig({}), values)
  }

}

export default GlobalConfig

