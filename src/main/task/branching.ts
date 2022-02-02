import { DistinctQuestion } from 'inquirer'
import chalk from 'chalk'
import semver from 'semver'
import poc from './branching-support/prompt-option-constants'
import prompts from './branching-support/prompts'
import {makeVersionBumpChoices} from './branching-support/prompts'
import t from '../util/toolbox'



export class Branching {

  constructor(...args) {
  }

  async init() {

    try {

      const ver = t.util.getImmediateVersion()
      const branch = await t.git.getCurBranchName()

      t.log.info('\nYou are currently working on branch ' +  chalk.blue.bold(branch) + ' which has package.json version set to ' + chalk.blue.bold(ver.version) + '\n')
      if(/master/.test(branch)){
        t.log.obtrusive('Nothing should be committed directly to master.  Completing a release is the only intended way to alter master.')
      }
      if(/release/.test(branch) && /-rc/.test(ver.version)){
        t.log.obtrusive(`This is a ${chalk.greenBright('Release Candidate')} branch.  You should only commit pre-release bug fixes here.\nSelect "Complete" when this branch is ready to be shipped.`)
      }
      if(/release/.test(branch) && !/-rc/.test(ver.version)){
        t.log.obtrusive(`This is a ${chalk.greenBright('Completed Release')}  branch.  Nothing should be committed to the branch.\nIf you need to create a Patch Release, select "Patch" to begin a new patch release branched from this release.`)
      }

    }
    catch (ex) {
      t.log.info('this should not happen during normal usage.  Likely missing a package.json.')
      t.log.info(ex)
      throw ex
    }
  }

  async startUI()
  {
    let goalTask = ''
    await t.step({
      prompt:prompts.targets,
      task: goal => {
        goalTask = goal
      }
    })
    return goalTask
  }


  // called from the initial selector.
  // based on user input it calls the correct task
  async doTask(task) {

    if (task == null) {
      throw new Error('null task found')
    }

    let confirm = '' + task
    // if (-1 !== confirm.indexOf('Git')) {
    //   confirm = confirm.substring(confirm.indexOf(']') + 1)
    // }

    switch (task) {
      case poc.RELEASE_BUGFIX: await this.task_ReleaseBugFix(); break
      case poc.RELEASE_PATCH: await this.task_ReleasePatch(); break
      case poc.MASTER_FEATURE: await this.task_MasterFeature(); break
      case poc.DEVELOP_FEATURE: await this.task_DevelopFeature(); break
      case poc.DEVELOP_RELEASE: await this.task_DevelopRelease(); break

      case poc.BUG_MERGE_MASTER: await this.task_BugMerge('master'); break
      case poc.BUG_MERGE_RELEASE: await this.task_BugMerge('rc'); break
      case poc.FEATURE_MERGE_TO_MASTER: await this.task_FeatureMergeToTarget('master'); break
      case poc.FEATURE_MERGE_TO_DEVELOP: await this.task_FeatureMergeToTarget('develop'); break
      case poc.FEATURE_MERGE_TO_SPECIFIC: await this.task_FeatureMergeToTarget('',true); break

      case poc.RELEASE_MERGE_TO_MASTER: await this.task_ReleaseMergeToMaster(); break

      case poc.BUMP_MANUAL: await this.task_BumpVersionManually(false); break
      case poc.BUMP_AUTO: await this.task_BumpVersionManually(true); break
      case poc.REPAIR_BRANCH: await this.task_Repair(); break

      case poc.GOTO_DEVELOP: await this.task_GoDevelop(); break
      case poc.GOTO_MASTER_RELEASE: await this.task_GoCurRelease(); break
      case poc.CANCEL: break

      case poc.BRANCH_UPDATE: await this.task_updateBranchFromDevelopFlow(); break

      case poc.FEATURE_ABANDON: await this.task_FeatureAbandon(); break
      case poc.RELEASE_ABANDON: await this.task_ReleaseAbandon(); break
      case poc.BUGFIX_ABANDON: await this.task_BugFixAbandon(); break
    }

  }


  async task_GoDevelop() {
    if (!await t.git.gotoDevelop()) {// go there.

      t.log.warn('The develop branch does not exist yet.   Press Y or Enter to create it...')
      await t.step({
        label: 'Create Develop',
        prompt: prompts.continueCheck,
        task: async () => {
          const goalVer = '1.0.0-dev.0'
          const goalBranch = 'develop'
          const curBranch = await t.git.getCurBranchName()

          // if it's not there, make it be there...
          t.log.obtrusive(`🚀 branching ${chalk.blue.bold(curBranch)} to ${chalk.blue.bold(goalBranch)} as ${chalk.blue.bold(goalVer)}`);

          await t.git.makeBranch(goalBranch)  // create the branch
          await t.git.setOrigin(goalBranch)  // setup the origin
          await t.util.bump(goalVer)                    // update the package.json version
          await t.git.afterBranch(goalBranch,goalVer)   // commit the changes
        }
      })
    }
  }

  async task_GoCurRelease() {
    const goalVer = t.util.getImmediateVersion()
    const goalBranch = 'release/'+goalVer.version

    if (!await t.git.gotoBranch(goalBranch)) {// go there.

      t.log.warn(`The ${goalBranch} branch does not exist yet.   Press Y or Enter to create it...`)
      await t.step({
        prompt: prompts.continueCheck,
        task: async () => {
          const curBranch = await t.git.getCurBranchName()

          // if it's not there, make it be there...
          t.log.obtrusive(`🚀 branching ${chalk.blue.bold(curBranch)} to ${chalk.blue.bold(goalBranch)} as ${chalk.blue.bold(goalVer.version)}`);

          await t.git.makeBranch(goalBranch)// create the branch
          await t.git.setOrigin(goalBranch)// setup the origin
          await t.util.bump(goalVer.version)// update the package.json version
          await t.git.afterBranch(goalBranch,goalVer.version)// commit the changes
        }
      })
      t.setState({goal:poc.TASK_COMPLETE})
    }
  }


  async task_BumpVersionManually(useMaster:boolean) {
    const fullVer = t.util.getImmediateVersion()
    let preMergeVersion = fullVer.version
    t.log.info(`On the current branch package.json version set to ` + chalk.blue.bold(preMergeVersion))
    const startBranch = await t.git.getCurBranchName()

    if(useMaster){
      await t.git.gotoBranch('master')
      const masterVersion = t.util.getImmediateVersion().version
      await t.git.gotoBranch(startBranch)
      t.log.info(`On the master branch package.json version set to ` + chalk.blue.bold(preMergeVersion))
      preMergeVersion = masterVersion
    }

    t.log.info(`${chalk.yellowBright('NOTE:')} All version changes include the pre-release build id.\nThe only time a version number appears without a pre-release id is when you have completed a release.`)

    if(/feature/.test(startBranch)){
      t.log.info('\nFor a feature branch, you can only increment the pre-release version.\nWhen you merge to develop, the version number on develop will be incremented.')
      t.log.info('Basically, if you start a feature on 1.1 but merge the feature into 1.3, the tool will "do the right thing"\n.')
    }

    const promptVal =   {
      type: 'list',
      message: 'What version change would you like?',
      choices: makeVersionBumpChoices(preMergeVersion),
      pageSize: 9
    } as DistinctQuestion

    await t.step({
      prompt: promptVal,
      task: async (incrementTarget) => {
        let levelToBump = incrementTarget

        if(levelToBump && levelToBump!=='SKIP'){
          const raw = t.util.parseVersion(preMergeVersion)
          const target = semver.inc(preMergeVersion, levelToBump,raw.preReleaseId||'dev')
          t.log.info(`Moving this branch from ${ chalk.blue.bold(preMergeVersion)} to ${chalk.blue.bold(target)}`)

          await t.step({
            prompt: prompts.continueCheck,
            task: async () => {
              await t.util.bump(target)
              await t.git.commitAll()
            }
          })
        }
      }
    })

  }

  //--- create working branches (bugfixes and feature branches need jira names, releases need an '-rc')

  async task_ReleaseBugFix() {
    t.log.info('This will create a working branch that is intended to be merged to this pre-release branch when complete.')
    const name:any = await this.nameFeature('bugfix')
    const ver = t.util.getImmediateVersion()
    const newVersion = semver.inc(ver.version,'prerelease',name.jiraName)
    const curBranch = await t.git.getCurBranchName()
    await this.createBranchFlow(name.newBranch, newVersion, curBranch)
  }

  async task_ReleasePatch() {
    const nameData = await this.nameFeature('bugfix'); // ask for the jira name of the fix
    const curVerData = t.util.getImmediateVersion(); // get the actual version on disk right now.
    const curBranchName = await t.git.getCurBranchName(); // get the actual version on disk right now.
    let newPatchVer = '';
    if (curVerData.isPreRelease) {
        // have to do this twice.  Once to get rid of the pre-release, then again to bump the patch version
        newPatchVer = semver.inc(curVerData.version, 'patch');
        newPatchVer = semver.inc(newPatchVer, 'prepatch', 'rc');
    }
    else {
        newPatchVer = semver.inc(curVerData.version, 'prepatch', 'rc');
    }
    const newPatchBranchName = 'release/' + t.util.removeVersionPreReleasePart(newPatchVer);
    // order matters here.  Make the branch name before adding the prerelease id
    newPatchVer = semver.inc(newPatchVer, 'prerelease');
    const newBugFixBranch = nameData.newBranch;
    const newBugFixVer = semver.inc(newPatchVer, 'prerelease', nameData.jiraName);

    const msg=
`${chalk.yellow('NOTE: ')}This will create two branches:
First, we will create a new patch branch from ${chalk.blue(curBranchName)} to ${chalk.blue(newPatchBranchName)} at version ${chalk.blue(newPatchVer)} targeted for merge to ${chalk.blue('master')}
Then we will create a new working branch called ${chalk.blue(newBugFixBranch)} at version ${chalk.blue(newBugFixVer)} targeted for merge to ${chalk.blue(newPatchBranchName)}
Complete the coding on the working branch.  PR and then use this tool to merge the working bugfix branch into the patch release candidate.
When all bugfixes are completed, use this tool again to complete the release candidate and merge it into master.`

    t.log.obtrusive(msg)

    await t.step({
        prompt: prompts.continueCheck,
        message: "Continue?",
        task: async (goal) => {
            await this.createBranchFlow(newPatchBranchName, newPatchVer, 'master');
            await this.createBranchFlow(newBugFixBranch, newBugFixVer, newPatchBranchName);
        }
    });
}

  async task_DevelopFeature() {
    var ver = t.util.getImmediateVersion()
    const name = await this.nameFeature('feature')
    await this.createBranchFlow(name.newBranch, t.util.removeVersionPreReleasePart(ver.version) + '-' + name.jiraName + '.0')
  }

  async task_MasterFeature() {
    var ver = t.util.getImmediateVersion()
    const name = await this.nameFeature('feature')
    await this.createBranchFlow(name.newBranch, t.util.removeVersionPreReleasePart(ver.version) + '-' + name.jiraName + '.0','master')
  }

  async task_DevelopRelease() {
    const curVer = t.util.getImmediateVersion()
    const newVer = t.util.removeVersionPreReleasePart(curVer.version)
    const newVerPre = newVer+'-rc.0'
    await this.createBranchFlow('release/' + newVer, newVerPre)
  }

  //--- merge work in to parent branches.
  async task_BugMerge(target) {

    const fixBranch = await t.git.getCurBranchName()

    if(target==='rc'){
      // it could be any release candidate.   Luckily, we left ourselves a note so we shouldn't have to ask.
      let rcTarget = t.util.getTargetBranch()
      if(rcTarget){
        t.log.info(`It looks like this bugfix is targeted to ${chalk.blue(rcTarget)}.`)
      }else{
        await t.step({
          prompt:prompts.getReleaseTarget,
          task:(goal)=>{
            rcTarget=goal
            t.log.info(`Confirming target release branch of ${chalk.blue(rcTarget)}.`)
          }
        })
      }

      await t.step({
        prompt: prompts.mergeCheck,
        task: async () => {
          await t.git.gotoBranch(fixBranch)
          await this.mergeBranchFlow(rcTarget)
        }
      })

      // also, this bugfix may need to go to develop.   Ask them if that's what they want.
      t.log.info(`Because this is a bugfix you may also need to merge to ${chalk.blue('develop')}.`)
      await t.step({
        prompt: prompts.mergeCheck,
        task: async () => {
          await t.git.gotoBranch(fixBranch)
          await this.mergeBranchFlow('develop',rcTarget)
        }
      })

      t.log.info(`If you've completed the last bugfix for this release, you may be ready to mark the release as completed and merge ${chalk.blue(rcTarget)} to master.`)
      await t.step({
        prompt: prompts.autoCompleteRelease,
        task: async () => {
          await t.git.gotoBranch(rcTarget)
          await this.task_ReleaseMergeToMaster()
        }
      })

      t.log.info(`If you're finished with this bugfix, would you like to delete the bugfix branch?`)
      await t.step({
        prompt: prompts.bugFixCleanup,
        task: async () => {
          await t.git.gotoDevelop()
          await t.git.deleteBranch(fixBranch)
          await t.shell.execVerbose(`git pull`)
        }
      })

    }
    else{
      await this.mergeBranchFlow(target)
    }

  }

  async task_FeatureMergeToTarget(uiTarget:string, justAsk:boolean=false) {

    let target = uiTarget
    const curBranch = await t.git.getCurBranchName()

    if(justAsk){
      await t.step({
        prompt:prompts.getFeatureTarget,
        task:(goal)=>{
          target=goal
        }
      })
    }

    await this.mergeBranchFlow(target)


    if(target==='develop'){
      t.log.info(`If you're finished with this feature, you may want to clean up the feature branch.`)
      await t.step({
        prompt: prompts.featureCleanup,
        task: async () => {
          await t.git.gotoDevelop()
          await t.git.deleteBranch(curBranch)
          await t.shell.execVerbose(`git pull`)
        }
      })
    }
  }

  async task_FeatureAbandon() {
    const fixBranch = await t.git.getCurBranchName()
    await t.util.branchWarning()
    await t.step({
      prompt: prompts.featureCleanup,
      task: async () => {
        await t.git.gotoDevelopOrMaster()
        await t.git.deleteBranch(fixBranch)
        await t.shell.execVerbose(`git pull`)
      }
    })
  }

  async task_ReleaseAbandon() {
    const fixBranch = await t.git.getCurBranchName()
    await t.util.branchWarning()
    await t.step({
      prompt: prompts.releaseCleanup,
      task: async () => {
        await t.git.gotoDevelopOrMaster()
        await t.git.deleteBranch(fixBranch)
        await t.shell.execVerbose(`git pull`)
      }
    })
  }

  async task_BugFixAbandon() {
    const fixBranch = await t.git.getCurBranchName()
    await t.util.branchWarning()
    await t.step({
      prompt: prompts.bugFixCleanup,
      task: async () => {
        await t.git.gotoDevelopOrMaster()
        await t.git.deleteBranch(fixBranch)
        await t.shell.execVerbose(`git pull`)
      }
    })
  }

  async task_ReleaseMergeToMaster() {

    const curVer = t.util.getImmediateVersion()
    const releaseVer = t.util.removeVersionPreReleasePart(curVer.version)
    if(curVer.version !== releaseVer){
      t.log.info(`Marking this release as complete by moving from ${chalk.blue.bold(curVer.version)} to ${chalk.blue.bold(releaseVer)}`)

      await t.step({
        prompt: prompts.continueCheck,
        task: async (goal) => {
          await t.util.bump(releaseVer)          // updates package.json with non-release-candidate version
          await t.git.commitAll()                // save it.
          await this.checkDevelopVersion()  // check if develop should be bumped
          await this.mergeBranchFlow('master')
          // JJHNOTE:  Are we missing tagging at this point?  Do we actually need it?
        }
      })
    }
    else{
      // already marked as complete, just merge it.
      t.log.info(`This release branch is already marked as complete at ${chalk.blue.bold(curVer.version)}`)
      await this.mergeBranchFlow('master')
    }

  }

  async task_Repair() {

    const startBranch = await t.git.getCurBranchName()

    let fixType = ''
    await t.step({
      prompt: prompts.renameType,
      task: goal => {
        fixType = goal
      }
    })

    if(fixType==='cancel'){
      return
    }

    t.log.info('moving branch to become a ' + fixType)
    const name = await this.nameFeature(fixType)

    t.log.info(`About to rename from ` + chalk.blue(`${startBranch}`) + ' ---> ' + chalk.blue(name.newBranch))
    await t.step({
      prompt: prompts.continueCheck,
      task: async (goal) => {
        await t.git.reNameBranch(name.newBranch,startBranch)
      }
    })

  }

  //------ Reused flows across multiple tasks

  async task_updateBranchFromDevelopFlow() {
    // hold on to the version that was on the target branch before the merge.  Do NOT user require here or it will give you the cached value.
    const ver = t.util.getImmediateVersion()
    const clText = t.util.getChangeLog()

    await t.shell.execVerbose(`git fetch -p`)

    //===== JJHNOTE:
    /*
    I feel like this should copy the values from develop, commit them, then merge, then reset to avoid conflicts.
    */

    try {
      await t.shell.execVerbose(`git merge origin/develop --no-commit --no-ff`) // --strategy-option=theirs`)
      t.log.info('merge successful.')
    }
    catch (err) {
      t.log.info('merge conflicts found.   Please resolve the conflicts and commit/push the merge.  Then run the tool again to be sure.')
      return
    }

    t.log.info('correcting the package version number and changelog for this branch.')
    t.util.setAllVersionData(ver.version)
    t.util.setChangeLog(clText)
    await t.git.commitAll()

    t.log.info('merge from develop complete, with branch version number and change log reset.')
  }


  async mergeBranchFlow(mergeTarget,originalRCTarget:string=null) {

    // if merging to develop, perform the merge check
    t.log.info('Prep Work: Learn about the target version.')

    // prevent a change log conflict
    // copy the changelog and the version number
    const clTextOnBranch = t.util.getChangeLog()
    const versionOnBranch = t.util.getImmediateVersion()
    const branchTargetOnBranch = t.util.getImmediateTargetBranch()
    const startingBranch = await t.git.getCurBranchName()

    // get the target.
    await t.shell.execVerbose(`git fetch -p`)
    await t.shell.execVerbose(`git checkout ${mergeTarget}`)
    await t.shell.execVerbose(`git pull`)

    // hold on to the version that was on the target branch before the merge.  Do NOT use require here or it will give you the cached value.
    let clTextOnTarget = t.util.getChangeLog()
    const versionOnTarget = t.util.getImmediateVersion()
    const branchTargetOnTarget = t.util.getImmediateTargetBranch()

    // return to current branch
    await t.shell.execVerbose(`git checkout ${startingBranch}`)

    let nextVersion = ''
    if(versionOnTarget.isPreRelease){
      nextVersion = semver.inc(versionOnTarget.version,'prerelease',versionOnTarget.preReleaseId)
    }
    else{
      if(versionOnBranch.isPreRelease){
        t.log.obtrusive( `${chalk.red('WARNING: ')} You are about to merge from a working branch to a completed branch!\nNormally, this is a ${chalk.yellow('"Bad Thing(tm)"')}`)

        let endNow = false
        await t.step({
          prompt: prompts.doYouWantToAbortMerge,
          task: async (choice) => {
            if(/Abort/.test(choice)){
              t.log.info('🚩 Exiting without altering the completed branch.')
              endNow=true
            }
          }
        })
        if(endNow){return}
        nextVersion = semver.inc(versionOnTarget.version,'minor')
      }
      else{
        nextVersion = versionOnBranch.version
      }
    }

    t.log.info(`We are about to merge ${chalk.blue.bold(startingBranch)} to ${chalk.blue.bold(mergeTarget)} and bump from version ${chalk.blue.bold(versionOnTarget.version)} to ${chalk.blue.bold(nextVersion)}`)

    await t.step({
      label: 'Git merge',
      prompt: prompts.continueCheck,
      task: async () => {
        t.log.obtrusive(`🚀 merging ${startingBranch} to ${mergeTarget}`);

        // update the version number on our branch to match what's on the target to avoid a conflict.
        t.log.info(`Temporarily setting ${versionOnTarget.version} / ${branchTargetOnTarget} to avoid conflicts on merge.`)
        t.util.setAllVersionData(versionOnTarget.version,branchTargetOnTarget)
        // update change log to match target to avoid a conflict
        t.util.setChangeLog(clTextOnTarget)
        await t.git.commitAll()  // be fresh for the merge

        if(mergeTarget==='develop' || /-rc/.test(mergeTarget)){
          try {
            // merge from target to branch
            t.log.info(`Safety Dance:   Pre-merging from ` + chalk.blue(mergeTarget) + ' ---> ' + chalk.blue(startingBranch) + ' to check for merge conflicts')
            // if there are merge failures, abort.  Make sure the merge failures are not due to package* or changelog.
            await t.shell.execVerbose(`git merge origin/${mergeTarget}  --no-commit --no-ff`) // --strategy-option=theirs`)

            // commit the merge.
            await t.shell.execVerbose(`git diff-index --quiet HEAD || git commit -m 'trial run merge from ${mergeTarget} to ${startingBranch}'`)
            await t.shell.execVerbose(`git push`)

          } catch (ex) {
            if (-1 === ex.message.indexOf('nothing to commit')) {
              t.log.error(ex)
              t.log.obtrusive('Unable to merge safely.  Please resolve the conflicts and then run the command again.')
              return
            }
            else {
              t.log.info('no changes found, but will continue anyway.')
              await t.shell.execVerbose(`git push`)
            }
          }
        }

        // goto the target
        await t.shell.execVerbose(`git checkout ${mergeTarget} --`)

        // merge
        await t.shell.execVerbose(`git merge origin/${startingBranch}  --no-commit --no-ff`) // --strategy-option=theirs`)

        // update the version number on our branch to match what's on the target to avoid a conflict.
        t.util.setAllVersionData(nextVersion,branchTargetOnTarget)
        // update change log to match target to avoid a conflict
        t.util.setChangeLog(clTextOnTarget,clTextOnBranch)
        t.util.addChangeLogLine(`🎯 merged from ${startingBranch} to ${mergeTarget} and set version to ${nextVersion}`)
        // remove target branch from anything that isn't a bugfix
        if(mergeTarget==='develop' || /-rc/.test(mergeTarget)){
          t.util.removeTargetBranch()
        }
        await t.git.commitAll(`🎯 merged from ${startingBranch} and set version to ${nextVersion}`)

        t.log.info(`Version updated to ${chalk.blue.bold(nextVersion)}.`)

        // check if develop needs to be bumped
        await this.checkDevelopVersion()

        t.log.info(`Putting original branch back in order...`)
        await t.shell.execVerbose(`git checkout ${startingBranch} --`)
        t.util.setAllVersionData(versionOnBranch.version,branchTargetOnBranch)
        t.util.setChangeLog(clTextOnBranch,'')
        await t.git.commitAll()  // be fresh for the merge

        // NOTE:  We should end up on the branch we started on in case we're doing multiple merges!
        t.log.info(`Merge Complete.`)

      }})


  }

  async createBranchFlow(newBranch:string, newVersion:string, targetBranch?:string) {

    const curBranch = await t.git.getCurBranchName()

    t.log.info('The new branch will be named:      ' + chalk.blue.bold(newBranch))
    t.log.info('The new branch will be at version: ' + chalk.blue.bold(newVersion)) // t.state.versionOverRide

    await t.step({
      label: 'Git branch',
      prompt: prompts.continueCheck,
      task: async () => {
        t.log.obtrusive(`🚀 branching ${chalk.blue.bold(curBranch)} to ${chalk.blue.bold(newBranch)} as ${chalk.blue.bold(newVersion)}`);
        // create the branch
        await t.git.makeBranch(newBranch)
        // setup the origin
        await t.git.setOrigin(newBranch)
        // update the package.json version
        await t.util.bump(newVersion)
        // commit the changes
        await t.git.afterBranch(newBranch, newVersion,`🟢 begin work on ${newBranch} at ${newVersion}`,targetBranch)
      }
    })
  }

  // ask for jira information to be used to name the branch and version
  async nameFeature(branchType) {

    let jiraName = ''
    let jiraDesc = ''
    let newBranch = ''

    // ask jira ticket number if it wasn't provided on command line
    // future validation: confirm ticket exists in jira
    if (t.options.jiraId) {
      jiraName = t.options.jiraId
    }
    else {
      await t.step({ prompt: prompts.jiraName, task: value => { jiraName = value } })
    }

    // ask description if not provided on command line
    if (t.options.jiraText) {
      jiraDesc = t.options.jiraText
    }
    else {
      await t.step({ prompt: prompts.jiraDesc, task: value => { jiraDesc = value } })
    }

    // the UX team likes to add their initials to know who owns what feature.
    const initials = t.util.getInitials()

    // validation: confirm desc can be made into a non-whitespace name
    jiraName = jiraName.replace(/\s/g, '-').toUpperCase()
    jiraDesc = jiraDesc.replace(/\s/g, '-')
    newBranch = initials + branchType + '/' + jiraName + '-' + jiraDesc
    return {
      jiraName: jiraName,
      jiraDesc: jiraDesc,
      newBranch: newBranch,
    }

  }

  async checkDevelopVersion() {
    const startBranch = await t.git.getCurBranchName()
    const startVer = await t.util.getImmediateVersion()

    await t.git.gotoDevelop()
    const devVer = await t.util.getImmediateVersion()

    if(semver.lt(devVer.version, startVer.version)){
      t.log.info(`Your develop branch is at ${chalk.blue(devVer.version)} which is before the version ${chalk.blue(startVer.version)}.`)
      t.log.info(`The develop branch should be at a pre-release version higher than your latest release.`)

      const bumpMajor = semver.inc(startVer.version,'premajor','dev')
      const bumpMinor = semver.inc(startVer.version,'preminor','dev')

      await t.step({
        prompt:{
          type: 'list',
          message: 'Would you like to bump the version on develop?',
          choices: [
            {name:`Yes, bump major version and put develop at ${bumpMajor}`,value:bumpMajor},
            {name:`Yes, bump minor version and put develop at ${bumpMinor}`,value:bumpMinor},
            {name:`No, leave develop at ${devVer.version}`,value:'SKIP'}
          ]
        },
        task: async (bumpGoal)=>{
          if(bumpGoal!=='SKIP'){
            await t.util.bump(bumpGoal)
            await t.git.commitAll()
          }
        }
      })
    }
    else{
      t.log.info(`Checked on the develop branch which is at ${chalk.blue(devVer.version)}.  This is after ${chalk.blue(startVer.version)} so no action is needed.`)
    }

    await t.git.gotoBranch(startBranch)
  }


}

export default new Branching()