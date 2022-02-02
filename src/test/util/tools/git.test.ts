
import t from '../../../main/util/toolbox'
import Git from '../../../main/util/tools/git'
import inquirer from 'inquirer'
// import fs from 'fs'

describe('exercise the git utilities', () => {

  beforeEach(() => {
    // https://github.com/facebook/jest/issues/7136
    jest.resetAllMocks();
    jest.restoreAllMocks();
    t.log.silentForTest=true
  })

  afterEach(()=>{
    // https://github.com/facebook/jest/issues/7136
    jest.resetAllMocks();
    jest.clearAllMocks()
    t.log.silentForTest=true
  })

  test('init', async () => {

    const git = new Git()

    // jest.spyOn(git,'getRemoteUrl').mockResolvedValue('/Users/john/doe/owner/project')
    jest.spyOn(git,'fetch').mockResolvedValue('')
    //jest.spyOn(git,'getLatestTagName').mockResolvedValue('t1')
    // jest.spyOn(git,'getSecondLatestTagName').mockResolvedValue('t2')

    jest.spyOn(git,'isRequiredBranch').mockResolvedValue(true)
    jest.spyOn(git,'isWorkingDirClean').mockResolvedValue(true)
    jest.spyOn(git,'hasUpstreamBranch').mockResolvedValue(true)
    // jest.spyOn(git,'getCommitsSinceLatestTag').mockResolvedValue(2)
    jest.spyOn(git,'getCurBranchName').mockResolvedValue('develop')

    t.global.requireBranch=false
    t.global.requireCleanWorkingDir=false
    t.global.requireUpstream=false
    t.global.requireCommits=false
    t.setState({push:false})

    try{
      await git.init()
    }
    catch(err){
      expect(true).toBe(false)
    }


    try{
      t.global.requireBranch=true
      jest.spyOn(git,'isRequiredBranch').mockResolvedValue(false)
      await git.init()
      expect(true).toBe(false)
    }
    catch(err){
    }

    try{
      t.global.requireBranch=true
      jest.spyOn(git,'isRequiredBranch').mockResolvedValue(true)
      await git.init()
    }
    catch(err){
      expect(true).toBe(false)
    }

    try{
      t.global.requireCleanWorkingDir=true
      jest.spyOn(git,'isWorkingDirClean').mockResolvedValue(true)
      await git.init()
    }
    catch(err){
      expect(true).toBe(false)
    }

    try{
      t.global.requireBranch=true
      jest.spyOn(git,'isWorkingDirClean').mockResolvedValue(false)
      await git.init()
      expect(true).toBe(false)
    }
    catch(err){
    }
    jest.spyOn(git,'isWorkingDirClean').mockResolvedValue(true)

    const hold =  git.remoteUrl

    // push
    try{
      t.state.push=true
      git.remoteUrl = null
      await git.init()
      expect(true).toBe(false)
    }
    catch(err){
    }

    try{
      t.state.push=false
      git.remoteUrl = hold
      await git.init()
    }
    catch(err){
      expect(true).toBe(false)
    }

    // upstream
    try{
      t.global.requireUpstream=true
      jest.spyOn(git,'hasUpstreamBranch').mockResolvedValue(false)
      await git.init()
      expect(true).toBe(false)
    }
    catch(err){
    }

    try{
      t.global.requireUpstream=true
      jest.spyOn(git,'hasUpstreamBranch').mockResolvedValue(true)
      await git.init()
    }
    catch(err){
      expect(true).toBe(false)
    }

  })


test('isRequiredBranch', async () => {

  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('develop')
  t.global.requireBranch = false
  expect(await t.git.isRequiredBranch()).toBe(true)

  t.global.requireBranch = true

  t.global.requireBranchList = null
  expect(await t.git.isRequiredBranch()).toBe(false)

  t.global.requireBranchList = []
  expect(await t.git.isRequiredBranch()).toBe(false)

  t.global.requireBranchList = ['develop']
  expect(await t.git.isRequiredBranch()).toBe(true)

  t.global.requireBranchList = ['master']
  expect(await t.git.isRequiredBranch()).toBe(false)

})

test('working dir', async () => {

  jest.spyOn(t.shell,'execVerbose').mockRejectedValueOnce('boom')
  expect(await t.git.isWorkingDirClean()).toBe(false)

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('true')
  expect(await t.git.isWorkingDirClean()).toBe(true)

})

test('has upstream branch', async () => {

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('develop')
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('develop')
  expect(await t.git.hasUpstreamBranch()).toBe(true)

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('develop')
  jest.spyOn(t.shell,'execVerbose').mockRejectedValueOnce('develop')
  expect(await t.git.hasUpstreamBranch()).toBe(false)

})

test('getCurBranchName', async () => {
  const gitLocal = new Git()
  jest.spyOn(t.shell,'exec').mockResolvedValueOnce('asdf/qwer/zxcv')
  expect(await gitLocal.getCurBranchName()).toBe('zxcv')
})

test('fetch', async () => {

  try{
    jest.spyOn(t.shell,'execVerbose').mockRejectedValue('boom')
    await t.git.fetch()
    expect(true).toBe(false)
  }
  catch(err){
  }
})

test('goto method Develop', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValueOnce('asdf/qwer/zxcv')
  expect(await t.git.gotoDevelop()).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValueOnce('boom')
  expect(await t.git.gotoDevelop()).toBe(false)
})

test('gotoMaster', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValueOnce('asdf/qwer/zxcv')
  expect(await t.git.gotoMaster()).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValueOnce('boom')
  expect(await t.git.gotoMaster()).toBe(false)
})

test('gotoBranch', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValueOnce('asdf/qwer/zxcv')
  expect(await t.git.gotoBranch('asdf')).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValueOnce('boom')
  expect(await t.git.gotoBranch('asdf')).toBe(false)
})

test('gotoDevelop method Or Master', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValueOnce('asdf/qwer/zxcv')
  expect(await t.git.gotoDevelopOrMaster()).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValue('boom')
  expect(await t.git.gotoDevelopOrMaster()).toBe(false)
})

test('makeBranch', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValue('asdf/qwer/zxcv')
  await t.git.makeBranch('none') // should not throw

  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('boom'))
  try{
    await t.git.makeBranch('none') // fails with unknown error
    expect(true).toBe(false)
  }
  catch(err){}

  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('branch already exists here'))
  jest.spyOn(inquirer,'prompt').mockResolvedValue({tempName:true})
  try{
    await t.git.makeBranch('none') // and goes to branch
    expect(true).toBe(false)
  }
  catch(err){
    expect(/Moved there/.test(err.message)).toBeTruthy()
  }

  jest.spyOn(t.shell,'exec').mockRejectedValueOnce(new Error('branch already exists here'))
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:false})
  try{
    await t.git.makeBranch('none') // and goes to branch
    expect(true).toBe(false)
  }
  catch(err){
    expect(/current branch/.test(err.message)).toBeTruthy()
  }

})

test('delete branch', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValue('asdf/qwer/zxcv')
  expect(await t.git.deleteBranch('asdf')).toBe(true)

  jest.spyOn(t.shell,'exec').mockImplementation( async (val:string)=>{
    if(/branch/.test(val)){
      return 'ok'  // work once
    }
    throw new Error() // then fail
  })
  expect(await t.git.deleteBranch('asdf')).toBe(false)
})

test('set origin', async () => {
  jest.spyOn(t.shell,'execVerbose').mockResolvedValue('asdf/qwer/zxcv')
  expect(await t.git.setOrigin('asdf')).toBe(true)

  jest.spyOn(t.shell,'execVerbose').mockRejectedValue('boom')
  expect(await t.git.setOrigin('asdf')).toBe(false)
})

test('rename branch', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValue('asdf/qwer/zxcv')
  expect(await t.git.reNameBranch('asdf','zxcv')).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValue('boom')
  expect(await t.git.reNameBranch('asdf','zxcv')).toBe(false)
})

test('commit all', async () => {
  jest.spyOn(t.shell,'exec').mockResolvedValue('asdf/qwer/zxcv')
  expect(await t.git.commitAll('asdf')).toBe(true)
  expect(await t.git.commitAll()).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('nothing to commit'))
  expect(await t.git.commitAll('asdf')).toBe(true)

  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('brimstone'))
  try{
    await t.git.commitAll('asdf')
    expect(true).toBe(false)
  }
  catch(err){}

})
test('after branch', async () => {
  // coverage only test.  Just making sure nothing blows up.
  jest.spyOn(t.util,'setTargetBranch').mockReturnValue()
  jest.spyOn(t.git,'commitAll').mockResolvedValue(true)

  expect(await t.git.afterBranch('a','b')).toBe(true)
  expect(await t.git.afterBranch('a','b','c')).toBe(true)
  expect(await t.git.afterBranch('a','b','c','d')).toBe(true)
})



})