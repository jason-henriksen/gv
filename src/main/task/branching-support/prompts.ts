import { DistinctQuestion } from 'inquirer'
import poc from './prompt-option-constants'
import t from '../../util/toolbox'
import chalk from 'chalk'
import semver from 'semver'


const makeBranchChoices = () => {

  // avoids making this method async at cost of using an external state.
  let curBranch = t.state.curBranch || 'master'
  let curVersion = t.util.getImmediateVersion()

  let choices = []
  if ('master' === curBranch) {
    choices = [
      poc.GOTO_DEVELOP,
      poc.GOTO_MASTER_RELEASE,
      poc.MASTER_FEATURE,
      poc.BUMP_MANUAL,
      poc.CANCEL
    ]
  }
  else if ('develop' === curBranch) {
    choices = [
      poc.DEVELOP_FEATURE,
      poc.DEVELOP_RELEASE,
      poc.BUMP_MANUAL,
      poc.BUMP_AUTO,
      poc.CANCEL
    ]
  }
  else if (curBranch.startsWith('bug')) {
    choices = [
      poc.BUG_MERGE_RELEASE,
      poc.BUG_MERGE_MASTER,
      poc.BRANCH_UPDATE,
      poc.BUMP_MANUAL,
      poc.BUGFIX_ABANDON,
      poc.REPAIR_BRANCH,
      poc.CANCEL
    ]
  }
  else if (curBranch.startsWith('feature')) {

    choices = [
      poc.FEATURE_MERGE_TO_SPECIFIC,
      poc.BRANCH_UPDATE,
      poc.REPAIR_BRANCH,
      poc.FEATURE_ABANDON,
      poc.BUMP_MANUAL,
      poc.CANCEL
    ]
    const target = t.util.getImmediateTargetBranch()
    if(!target){
      choices.unshift(poc.FEATURE_MERGE_TO_MASTER)
      choices.unshift(poc.FEATURE_MERGE_TO_DEVELOP)
    }
    else if ('master'===target){
      choices.unshift(poc.FEATURE_MERGE_TO_MASTER)
    }
    else if ('develop'===target){
      choices.unshift(poc.FEATURE_MERGE_TO_DEVELOP)
    }

  }
  else if (curBranch.startsWith('release')) {
    if(curVersion.isPreRelease){
      choices = [
        poc.RELEASE_MERGE_TO_MASTER,
        poc.RELEASE_ABANDON,
        poc.RELEASE_BUGFIX,
        poc.RELEASE_PATCH,
        poc.BUMP_MANUAL,
        poc.CANCEL
      ]
    }
    else{
      choices = [
        poc.RELEASE_MERGE_TO_MASTER,
        poc.RELEASE_ABANDON,
        poc.RELEASE_PATCH,
        poc.BUMP_MANUAL,
        poc.CANCEL
      ]
    }
  }
  else {
    choices = [
      poc.REPAIR_BRANCH,
      poc.FEATURE_ABANDON,
      poc.CANCEL
    ]
  }

  return choices

}

export const makeVersionBumpChoices = (currentVersion) => {
  let curBranch = t.state.curBranch || 'master'

  const raw = t.util.parseVersion(currentVersion)

  const MAJOR =         {name:chalk.bold.white('major:') +` ${currentVersion} => ${semver.inc(currentVersion, 'premajor',raw.preReleaseId)} ( breaking changes, pre-release )`,value:'premajor'}
  const MINOR =         {name:chalk.bold.white('minor:') +` ${currentVersion} => ${semver.inc(currentVersion, 'preminor',raw.preReleaseId)} ( non-breaking changes, pre-release )`,value:'preminor'}
  const MAJOR_MASTER =  {name:chalk.bold.white('major:') +` ${currentVersion} => ${semver.inc(currentVersion, 'major',raw.preReleaseId)} ( breaking changes )`,value:'major'}
  const MINOR_MASTER =  {name:chalk.bold.white('minor:') +` ${currentVersion} => ${semver.inc(currentVersion, 'minor',raw.preReleaseId)} ( non-breaking changes )`,value:'minor'}
  const FIX   =         {name:chalk.bold.white('patch:') +` ${currentVersion} => ${semver.inc(currentVersion, 'prepatch',raw.preReleaseId)} ( production fixes only )`,value:'prepatch'}
  const PRE   =         {name:chalk.bold.white('pre:  ') +` ${currentVersion} => ${semver.inc(currentVersion, 'prerelease',raw.preReleaseId)} ( pre-release builds )`,value:'prerelease'}
  const CANCEL=         {name:chalk.bold.white('cancel') ,value:'SKIP'}

  let choices = []
  if ('master' === curBranch) {
    choices = [
      MAJOR_MASTER,
      MINOR_MASTER,
      CANCEL
    ]
  }
  else if ('develop' === curBranch) {
    choices = [
      MAJOR,
      MINOR,
      PRE,
      CANCEL
    ]
  }
  else if (curBranch.startsWith('bug')) {
    choices = [
      MAJOR,
      MINOR,
      FIX,
      PRE,
      CANCEL
    ]
  }
  else if (curBranch.startsWith('feature')){
    choices = [
      PRE,
      CANCEL
    ]
  }
  else if (curBranch.startsWith('release')){
    choices = [
      PRE,
      chalk.yellow('▼ ▼ ▼ Here down is only available to repair mistakes ▼ ▼ ▼'),
      MAJOR,
      MINOR,
      FIX,
      CANCEL,
    ]
  }
  else {
    choices = [
      MAJOR,
      MINOR,
      FIX,
      PRE,
      CANCEL
    ]
  }
  return choices
}

const prompts = {
  targets: {
    type: 'list',
    message: 'What would you like to do?',
    choiceMaker: makeBranchChoices,
    pageSize:9
} as DistinctQuestion,
  renameType: {
    type: 'list',
    message: 'What kind of branch is this?',
    choices: ['feature','bugfix','cancel'],
    pageSize:9
} as DistinctQuestion,
  doYouWantToAbortMerge: {
    type: 'list',
    message: 'Are you sure?',
    choices: ['Yes, I am intending to alter a version that has been marked as complete.','Abort! Abort! Abort!'],
    pageSize:9
} as DistinctQuestion,
  jiraName: {
    type: 'input',
    message: 'What is the Jira number? ( ex: CCP-1234 )',
    pageSize:9
} as DistinctQuestion,
  jiraDesc: {
    type: 'input',
    message: 'What is the branch name? ( spaces will be made into dashes )',
    pageSize:9
} as DistinctQuestion,
  getReleaseTarget: {
    type: 'input',
    message: 'What is the branch name of the release you want to apply this bugfix to? ( ex: release/1.2.3 )',
    pageSize:9
} as DistinctQuestion,
  getFeatureTarget: {
    type: 'input',
    message: 'What is the branch name you want to apply this feature to? ( ex: release/1.2.3 )',
    pageSize:9
} as DistinctQuestion,
  continueCheck: {
    type: 'confirm',
    message: 'Continue?',
    pageSize:9
} as DistinctQuestion,
  mergeCheck: {
    type: 'confirm',
    message: 'Would you like to merge to that branch?',
    pageSize:9
} as DistinctQuestion,
  autoCompleteRelease: {
    type: 'confirm',
    message: 'Would you like to complete this release and merge to master?',
    pageSize:9
} as DistinctQuestion,
  gitMakeBranch: {
    type: 'confirm',
    message: 'Create branch?',
    pageSize:9
} as DistinctQuestion,
  gitDevelopBranch: {
    type: 'confirm',
    message: 'Create develop branch?',
    pageSize:9
} as DistinctQuestion,
  gitPushBranch: {
    type: 'confirm',
    message: 'Push branch to origin?',
    pageSize:9
} as DistinctQuestion,
  noChangesFound: {
    type: 'confirm',
    message: 'No changes were found?  That is odd.  Press Enter to abort this empty version.   Or press (n) to skip the abort and continue making an empty version...',
    pageSize:9
} as DistinctQuestion,
  featureCleanup: {
    type: 'confirm',
    message: 'Would you like to delete this feature branch?',
    pageSize:9
} as DistinctQuestion,
  releaseCleanup: {
    type: 'confirm',
    message: 'Would you like to delete this release branch?',
    pageSize:9
} as DistinctQuestion,
  bugFixCleanup: {
    type: 'confirm',
    message: 'Would you like to delete this bug fix branch?',
    pageSize:9
} as DistinctQuestion,
  featureMergeTarget: {
    type: 'choice',
    message: 'Where are you merging this feature to?',
    choices:[
      {name:chalk.bold.white('develop:') +` use this for ${chalk.blue('GitFlow')}`,value:'develop'},
      {name:chalk.bold.white('master:') +` use this for ${chalk.blue('GitHubFlow')}`,value:'master'},
      {name:chalk.bold.yellow('----- to avoid this question:  set the option style:"git" or style:"github" in ~/.cc-flow-options.json '),value:'develop'}
    ],
    pageSize:9
} as DistinctQuestion


}

export default prompts