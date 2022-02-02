import fs from 'fs'
import _ from 'lodash'
import findUp from 'find-up'
import {
  GitRequiredBranchError,
  GitCleanWorkingDirError,
  GitRemoteUrlError,
  GitUpstreamError,
  GitNoCommitsError,
  GitCommitError,
  GitNetworkError
} from './errors'

import t from '../toolbox'
import { DistinctQuestion } from 'inquirer';

const changelogFallback = 'git log --pretty=format:"* %s (%h)"';

export const prompts = {
  tag: {
    type: 'confirm',
    message: `Tag this branch?`,
    default: true
  } as DistinctQuestion,
  push: {
    type: 'confirm',
    message: 'Push?',
    default: true
  } as DistinctQuestion,
  reviewLog: {
    type: 'confirm',
    message: `Review the change log?`
  } as DistinctQuestion,
  gotoBranchCheck: {
    type: 'confirm',
    message: 'Would you like to switch to that branch?',
  } as DistinctQuestion,
  prTrailName: {
    type: 'input',
    message: 'What is your sub-task name? ',
  } as DistinctQuestion,

};



const noop = Promise.resolve();
const invalidPushRepoRe = /^\S+@/;
const options = { write: false };

class Git {
  constructor(...args) {
  }

  newTrail = 'Start a new trail...     ( use this when multiple developers are working on the same feature )'
  defTrail = 'Use the default trail... ( use this when only one developer is working on this feature )'

  remoteUrl:string

  async init() {

    t.log.info('Checking that git is in order...')

    await this.fetch();

    if (t.global.requireBranch && !(await this.isRequiredBranch())) {
      throw new GitRequiredBranchError(t.global.requireBranchList);
    }
    if (t.global.requireCleanWorkingDir && !(await this.isWorkingDirClean())) {
      throw new GitCleanWorkingDirError();
    }
    if (t.global.requireUpstream && !(await this.hasUpstreamBranch())) {
      throw new GitUpstreamError();
    }

    let curBranch = await this.getCurBranchName();
    t.setState({
      curBranch: curBranch // used by prompts.
    });
    t.log.info('Git status looks good.')

  }

  async isRequiredBranch() {
    const branch = await this.getCurBranchName();
    if(t.global.requireBranch){
      if(t.global.requireBranchList===null || t.global.requireBranchList.length===0){
        t.log.error('Being on a specific branch is required, but no valid branch list was supplied.')
        return false
      }
      else{
        const requiredBranches = _.castArray(t.global.requireBranchList);
        return requiredBranches.includes(branch)
      }
    }
    return true
  }

  async hasUpstreamBranch() {
    const ref = await t.shell.execVerbose('git symbolic-ref HEAD');
    const branch = await t.shell.execVerbose(`git for-each-ref --format="%(upstream:short)" ${ref}`).catch(
      () => null
    );
    return Boolean(branch);
  }

  /* maybe useful later?
  tagExists(tag) {
    return t.shell.exec(`git show-ref --tags --quiet --verify -- refs/tags/${tag}`).then(
      () => true,
      () => false
    );
  }
  */

  async isWorkingDirClean():Promise<boolean> {
    try{
      await t.shell.execVerbose('git diff-index --quiet HEAD --')
      return true
    }
    catch(err){
      return false
    }
  }

  async getCurBranchName() {
    return t.shell.exec(`git symbolic-ref --quiet HEAD`).then((val) => {
      // remove the first two path parts
      let res = (''+val).substring((''+val).indexOf('/')+1)
      res = ('' + res).substring(res.indexOf('/')+1)

      t.setState({curBranch:res})
      return res;
    });
  }


  fetch() {
    return t.shell.execVerbose('git fetch -p').catch(err => {
      t.log.debug(err);
      throw new GitNetworkError(err, this.remoteUrl);
    });
  }

  async gotoDevelop() {
    try {
      await t.shell.exec(`git checkout develop`)
      return true
    } catch (ex) {
      return false
    }
  }

  async gotoMaster() {
    try {
      await t.shell.exec(`git checkout master`)
      return true
    } catch (ex) {
      return false
    }
  }

  async gotoBranch(branchName) {
    try {
      await t.shell.exec(`git checkout ${branchName}`)
      return true
    } catch (ex) {
      return false
    }
  }

  async gotoDevelopOrMaster() {
    if(!await this.gotoDevelop()){
      return await this.gotoMaster()
    }
    return true
  }

  async makeBranch(newBranch) {
    try {
      const ref = await t.shell.exec(`git checkout -b ${newBranch}`)
    }
    catch (ex) {
      if(/already exists/.test(ex.message)){
        await t.step({
          prompt: prompts.gotoBranchCheck,
          task: async () => {
            await this.gotoBranch(newBranch)
            throw new Error('Release branch existed.  Moved there instead.')
          }
        })
        throw new Error('Release branch existed.  Stayed on current branch.')
      }
      else{
        throw ex
      }
    }
  }

  async deleteBranch(curBranch) {
    try {
      await t.shell.execVerbose(`git branch -d ${curBranch}`)
      await t.shell.execVerbose(`git push origin --delete ${curBranch}`)
      return true
    }
    catch (ex) {
      t.log.error(ex.message)
      return false
    }
  }

  async setOrigin(newBranch) {
    try {
      await t.shell.execVerbose(`git push --set-upstream origin ${newBranch}`)
      return true
    } catch (ex) {
      t.log.warn(ex.message)
      return false
    }
  }


  async reNameBranch(newBranch,oldBranch) {
    try {
      await t.shell.execVerbose(`git branch --move ${oldBranch}  ${newBranch}`)
      await t.shell.execVerbose(`git push --set-upstream origin ${newBranch}`)
      return true
    } catch (ex) {
      t.log.warn(ex.message)
      return false
    }
  }

  // this one is
  async commitAll(msg?:string){
    try{
      await t.shell.execVerbose(`git add .`)
      await t.shell.execVerbose(`git diff-index --quiet HEAD || git commit -m '${msg||'merged'}'`)
      await t.shell.execVerbose(`git push`)
      return true
    }
    catch(err){
      if(!/nothing to commit/.test(err.message)){ // ignore if this is the message
        throw err
      }
      return true
    }
  }

  // target branch is only saved so that a bugfix knows what release it is wanting to be merged to
  async afterBranch(branch:string, version:string, msg?:string, targetBranch?:string){

    // add merge target if given ( this is the primary target, develop will also be offered on bugfixes )
    if(targetBranch){
      t.util.setTargetBranch(targetBranch)
    }

    // commit and push
    if(!msg){
      msg = `🟢 created branch ${branch} with version ${version}`
    }
    t.util.addChangeLogLine(msg)
    return await this.commitAll(msg)
  }


}

export default Git;
