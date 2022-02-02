// runtime state passed between tasks

interface GitRepoData{
  host?: string,
  owner?: string,
  project?: string,
  protocol?: string,
  remote?: string,
  repository?: string
}
class RuntimeState{
  name:string=''
  latestVersion?:string=''
  preMergeVersion?:string=''
  private?:boolean=false
  publishConfig?:any={}

  versionTypesOverRide?:Array<string>=[]
  versionOverRide?:string=''

  versionChoiceDisabled?:boolean=false

  prOptionList?:Array<string>=[]

  // major.minor.patch-tag.tagVersion
  // ex:  1.2.3-alpha.4
  major?:number=0
  minor?:number=0
  patch?:number=0
  tagVersion?:number=0
  tagTemplate?:string=''

  isUpdate?:boolean=false
  tagName?:string=''
  tagAnnotation?:string=''

  pushRepo?:string=''
  tagArgs?:Array<string>=[]
  pushArgs?:Array<string>=[]
  commitArgs?:Array<string>=[]

  tagFormat?:string=''
  latestTagName?:string=''
  secondLatestTagName?:string=''
  forceLatestVersion?:string=''

  curBranch?:string=''

  // are these two actually the same thing?  JJHNOTE
  latestIsPreRelease?:boolean=false
  isPreRelease?:boolean=false
  preReleaseId?:string=''

  changelog?:boolean=false
  changelogText?:string=''
  commitMessage?:string=''
  gitRepoData?:GitRepoData={}

  isReleased?:boolean=false

  // git
  addUntrackedFiles?:boolean=false
  tag?:boolean=false
  commit?:boolean=false // might be needsCommit?  not sure
  push?:boolean=false // might be needsPush?  not sure
  isCommitted?:boolean=false
  isTagged?:boolean=false
  gitPreReleaseName?:string=''
  gitPreventTagging?:boolean=false
  gitForceTagging?:boolean=false

  // branching
  goal?:string=''
  task?:string=''
  version?:string=''

  action?:string=''
  incrementNeeded?:boolean=false
  latestTag?:string=''

  constructor( values: Partial<RuntimeState>={})
  {
    Object.assign(this,values)
  }

  set(values:Partial<RuntimeState>={}){
    Object.assign(this,values)
  }

  reset(values:Partial<RuntimeState>={}){
    Object.assign(this,new RuntimeState({}), values)
  }

}
export default RuntimeState

