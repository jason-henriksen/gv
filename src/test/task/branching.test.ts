import t from '../../main/util/toolbox'
import b from '../../main/task/branching'
import inquirer from 'inquirer'
import poc from '../../main/task/branching-support/prompt-option-constants'


describe('branching tests', () => {


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

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')
  await b.init()

  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('release/1.2.3')
  await b.init()

  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('release/1.2.3')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-rc.1',isPreRelease:true,preReleaseId:'rc'})
  await b.init()

  // JJHNOTE test logging here.

  jest.spyOn(t.git,'getCurBranchName').mockImplementationOnce(()=>{ throw new Error('oops')})
  try{
    await b.init()
    expect(false).toBe(true)
  }
  catch(err){}

  // startUI
  jest.spyOn(inquirer,'prompt').mockResolvedValue({tempName:poc.GOTO_DEVELOP})
  const res = await b.startUI()
  expect(res).toBe(poc.GOTO_DEVELOP)

})

test('task error and cancel', async () => {
  try{
    await b.doTask(null)
    expect(false).toBe(true)
  }
  catch(err){}
  await b.doTask(poc.CANCEL)
})

test('RELEASE_BUGFIX', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  // mock & test create branch flow
  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.RELEASE_BUGFIX)

  expect(target).toBeCalledWith('bugfix/JIRA-1234-my-fix','1.2.4-JIRA-1234.0',
                                `🟢 begin work on bugfix/JIRA-1234-my-fix at 1.2.4-JIRA-1234.0`,
                                'master')

})

test('RELEASE_PATCH 1', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  // first time is non-pre-release
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})

  jest.spyOn(t.git,'makeBranch').mockResolvedValue()
  jest.spyOn(t.git,'setOrigin').mockResolvedValue(true)
  jest.spyOn(t.util,'bump').mockResolvedValue(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValue(true)

  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  await b.doTask(poc.RELEASE_PATCH)

  expect(target.mock.calls.length).toBe(2)
  expect(target.mock.calls[0]).toMatchObject([
    "release/1.2.4",
    "1.2.4-rc.1",
    "🟢 begin work on release/1.2.4 at 1.2.4-rc.1",
    "master"
  ])
  expect(target.mock.calls[1]).toMatchObject(
  ["bugfix/JIRA-1234-my-fix",
    "1.2.4-JIRA-1234.0",
    "🟢 begin work on bugfix/JIRA-1234-my-fix at 1.2.4-JIRA-1234.0",
    "release/1.2.4"
  ])
})

test('RELEASE_PATCH 2', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  // first time is non-pre-release
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-rc.4',isPreRelease:true,preReleaseId:'rc'})

  jest.spyOn(t.git,'makeBranch').mockResolvedValue()
  jest.spyOn(t.git,'setOrigin').mockResolvedValue(true)
  jest.spyOn(t.util,'bump').mockResolvedValue(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValue(true)

  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  await b.doTask(poc.RELEASE_PATCH)

  expect(target.mock.calls.length).toBe(2)
  expect(target.mock.calls[0]).toMatchObject([
    "release/1.2.4",
    "1.2.4-rc.1",
    "🟢 begin work on release/1.2.4 at 1.2.4-rc.1",
    "master"
  ])
  expect(target.mock.calls[1]).toMatchObject(
  ["bugfix/JIRA-1234-my-fix",
    "1.2.4-JIRA-1234.0",
    "🟢 begin work on bugfix/JIRA-1234-my-fix at 1.2.4-JIRA-1234.0",
    "release/1.2.4"
  ])
})

test('MASTER_FEATURE', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  // mock & test create branch flow
  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.MASTER_FEATURE)

  expect(target).toBeCalledWith('feature/JIRA-1234-my-fix','1.2.3-JIRA-1234.0',
                                `🟢 begin work on feature/JIRA-1234-my-fix at 1.2.3-JIRA-1234.0`,
                                'master')

})

test('DEVELOP_FEATURE', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  // mock & test create branch flow
  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.DEVELOP_FEATURE)

  expect(target).toBeCalledWith('feature/JIRA-1234-my-fix','1.2.3-JIRA-1234.0',
                                `🟢 begin work on feature/JIRA-1234-my-fix at 1.2.3-JIRA-1234.0`,
                                undefined)

})

test('DEVELOP_RELEASE', async () => {

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my fix'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('master')

  // mock & test create branch flow
  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  const target = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.DEVELOP_RELEASE)

  expect(target).toBeCalledWith('release/1.2.3','1.2.3-rc.0',
                                `🟢 begin work on release/1.2.3 at 1.2.3-rc.0`,
                                undefined)
})

test('BUG_MERGE_MASTER', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('bugfix/inst-1234-myfix')
  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  await b.doTask(poc.BUG_MERGE_MASTER) // target will be master
  expect(spy).toHaveBeenCalledWith('master')
})

test('BUG_MERGE_RELEASE with rc target', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('bugfix/inst-1234-myfix')
  jest.spyOn(t.git,'gotoBranch').mockResolvedValue(true)
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValue(true)
  jest.spyOn(t.util,'getTargetBranch').mockReturnValue('release/1.2.3-rc.4')
  jest.spyOn(t.shell,'exec').mockResolvedValue(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValue(true)

  jest.spyOn(b,'task_ReleaseMergeToMaster').mockResolvedValue() // test separately
  const spyDelete = jest.spyOn(t.git,'deleteBranch').mockResolvedValue(true)

  // skip ask for target
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // merge check rcTarget
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // merge check develop
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // mark release complete
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // delete bugfix branch

  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  await b.doTask(poc.BUG_MERGE_RELEASE)

  expect(spy.mock.calls[0][0]).toBe('release/1.2.3-rc.4')
  expect(spy.mock.calls[1][0]).toBe('develop')
  expect(spyDelete.mock.calls[0][0]).toBe('bugfix/inst-1234-myfix')
})

test('BUG_MERGE_RELEASE with NO rc target', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValue('bugfix/inst-1234-myfix')
  jest.spyOn(t.git,'gotoBranch').mockResolvedValue(true)
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValue(true)
  jest.spyOn(t.util,'getTargetBranch').mockReturnValue(null)
  jest.spyOn(t.shell,'exec').mockResolvedValue(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValue(true)

  jest.spyOn(b,'task_ReleaseMergeToMaster').mockResolvedValue() // test separately
  const spyDelete = jest.spyOn(t.git,'deleteBranch').mockResolvedValue(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'release/1.2.3-rc.4'}) // ask for target
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // merge check rcTarget
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // merge check develop
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // mark release complete
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // delete bugfix branch

  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  await b.doTask(poc.BUG_MERGE_RELEASE)

  expect(spy.mock.calls[0][0]).toBe('release/1.2.3-rc.4')
  expect(spy.mock.calls[1][0]).toBe('develop')
  expect(spyDelete.mock.calls[0][0]).toBe('bugfix/inst-1234-myfix')
})

test('FEATURE_MERGE_TO_MASTER', async () => {
  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  await b.doTask(poc.FEATURE_MERGE_TO_MASTER)
  expect(spy.mock.calls[0][0]).toBe('master')
})

test('FEATURE_MERGE_TO_DEVELOP and delete', async () => {
  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'}) // merge check rcTarget
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValueOnce(true)
  jest.spyOn(t.git,'deleteBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  await b.doTask(poc.FEATURE_MERGE_TO_DEVELOP)
  expect(spy.mock.calls[0][0]).toBe('develop')
})

test('FEATURE_MERGE_TO_DEVELOP and keep', async () => {
  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'false'}) // merge check rcTarget
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValueOnce(true)
  jest.spyOn(t.git,'deleteBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  await b.doTask(poc.FEATURE_MERGE_TO_DEVELOP)
  expect(spy.mock.calls[0][0]).toBe('develop')
})

test('FEATURE_MERGE_TO_SPECIFIC', async () => {
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'release/1.2.3-rc.4'})
  const spy = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()
  await b.doTask(poc.FEATURE_MERGE_TO_SPECIFIC)
  expect(spy.mock.calls[0][0]).toBe('release/1.2.3-rc.4')
})

test('RELEASE_MERGE_TO_MASTER not yet marked complete', async () => {

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-rc.0',isPreRelease:true,preReleaseId:'rc'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)
  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  const spy1 = jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  const spy2 = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()

  await b.doTask(poc.RELEASE_MERGE_TO_MASTER)
  expect(spy1.mock.calls[0][0]).toBe('1.2.3')
  expect(spy2.mock.calls[0][0]).toBe('master')
})

test('RELEASE_MERGE_TO_MASTER marked as complete', async () => {

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  const spy2 = jest.spyOn(b,'mergeBranchFlow').mockResolvedValue()

  await b.doTask(poc.RELEASE_MERGE_TO_MASTER)
  expect(spy2.mock.calls[0][0]).toBe('master')
})

test('GOTO_DEVELOP branch exists', async () => {
  // just makes the call and it worked.
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValueOnce(true)
  await b.doTask(poc.GOTO_DEVELOP)
})

test('GOTO_DEVELOP branch does not exist', async () => {
  // just makes the call and it worked.
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValueOnce(false)
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  const spy = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.GOTO_DEVELOP)
  expect(spy.mock.calls[0][0]).toBe('develop')
  expect(spy.mock.calls[0][1]).toBe('1.0.0-dev.0')

})

test('GOTO_MASTER_RELEASE branch exists', async () => {
  // just makes the call and it worked.
  jest.spyOn(t.git,'gotoBranch').mockResolvedValueOnce(true)
  await b.doTask(poc.GOTO_MASTER_RELEASE)
})

test('GOTO_MASTER_RELEASE branch does not exist', async () => {
  // just makes the call and it worked.
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.git,'gotoBranch').mockResolvedValueOnce(false)
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'true'})

  jest.spyOn(t.git,'makeBranch').mockResolvedValueOnce()
  jest.spyOn(t.git,'setOrigin').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  const spy = jest.spyOn(t.git,'afterBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.GOTO_MASTER_RELEASE)
  expect(spy.mock.calls[0][0]).toBe('release/1.2.3')
  expect(spy.mock.calls[0][1]).toBe('1.2.3')
})

test('BUMP_MANUAL develop minor', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('develop')

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'preminor'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  await b.doTask(poc.BUMP_MANUAL)
  expect(spy.mock.calls[0][0]).toBe('1.3.0-dev.0')
})

test('BUMP_MANUAL feature minor', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-INST-123.4',isPreRelease:true,preReleaseId:'INST-123'})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('feature/1.2.3-INST-123-asdf')

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'prerelease'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  await b.doTask(poc.BUMP_MANUAL)
  expect(spy.mock.calls[0][0]).toBe('1.2.3-INST-123.5')
})

test('BUMP_MANUAL develop null', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('develop')

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:''})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  await b.doTask(poc.BUMP_MANUAL)
  expect(spy.mock.calls.length).toBe(0)
})

test('BUMP_AUTO develop minor', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('develop')

  jest.spyOn(t.git,'gotoBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.3.6',isPreRelease:false,preReleaseId:null})

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'preminor'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce({})
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  await b.doTask(poc.BUMP_AUTO)
  expect(spy.mock.calls[0][0]).toBe('1.4.0-dev.0')
})

test('REPAIR_BRANCH feature', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('utter/nonsense')
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'feature'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'INST-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my_feature'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.git,'reNameBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.REPAIR_BRANCH)
  expect(spy.mock.calls[0]).toMatchObject(['feature/INST-1234-my_feature','utter/nonsense'])
})

test('REPAIR_BRANCH cancel', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('utter/nonsense')
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'cancel'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'INST-1234'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my_feature'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  const spy = jest.spyOn(t.git,'reNameBranch').mockResolvedValueOnce(true)

  await b.doTask(poc.REPAIR_BRANCH)
  expect(spy.mock.calls.length).toBe(0)
})

test('BRANCH_UPDATE no conflict', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('111\n222\n333\n')
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('')

  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  await b.doTask(poc.BRANCH_UPDATE)
  expect(spy.mock.calls[0][0]).toBe('1.2.3-dev.4')

})

test('BRANCH_UPDATE with conflict', async () => {
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('111\n222\n333\n')
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce('')

  jest.spyOn(t.shell,'execVerbose').mockRejectedValueOnce(new Error('thud'))

  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()

  await b.doTask(poc.BRANCH_UPDATE)
  expect(spy.mock.calls.length).toBe(0)
})

test('FEATURE_ABANDON with conflict', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('feature/INST-1234')
  jest.spyOn(t.util,'branchWarning').mockResolvedValueOnce()
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  jest.spyOn(t.git,'gotoDevelopOrMaster').mockResolvedValueOnce(true)
  const spy = jest.spyOn(t.git,'deleteBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  await b.doTask(poc.FEATURE_ABANDON)
  expect(spy.mock.calls[0][0]).toBe('feature/INST-1234')
})

test('RELEASE_ABANDON with conflict', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('release/1.2.3')
  jest.spyOn(t.util,'branchWarning').mockResolvedValueOnce()
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  jest.spyOn(t.git,'gotoDevelopOrMaster').mockResolvedValueOnce(true)
  const spy = jest.spyOn(t.git,'deleteBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  await b.doTask(poc.RELEASE_ABANDON)
  expect(spy.mock.calls[0][0]).toBe('release/1.2.3')
})

test('BUGFIX_ABANDON with conflict', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('bugfix/INST-1234')
  jest.spyOn(t.util,'branchWarning').mockResolvedValueOnce()
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:true})
  jest.spyOn(t.git,'gotoDevelopOrMaster').mockResolvedValueOnce(true)
  const spy = jest.spyOn(t.git,'deleteBranch').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  await b.doTask(poc.BUGFIX_ABANDON)
  expect(spy.mock.calls[0][0]).toBe('bugfix/INST-1234')
})

test('nameFeature non-cli', async () => {
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'jira-543'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'my New Toy'})
  jest.spyOn(t.util,'getInitials').mockReturnValueOnce('')

  const res = await b.nameFeature('feature')
  expect(res.jiraName).toBe('JIRA-543')
  expect(res.jiraDesc).toBe('my-New-Toy')
  expect(res.newBranch).toBe('feature/JIRA-543-my-New-Toy')
})

test('nameFeature with-cli', async () => {
  t.setOptions({jiraId:'jira 543',jiraText:'my New Toy'})
  jest.spyOn(t.util,'getInitials').mockReturnValueOnce('jh/')

  const res = await b.nameFeature('bugfix')
  expect(res.jiraName).toBe('JIRA-543')
  expect(res.jiraDesc).toBe('my-New-Toy')
  expect(res.newBranch).toBe('jh/bugfix/JIRA-543-my-New-Toy')
})

test('checkDevelopVersion develop needs update and commit', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('master')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.6.0',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValue(true)
  jest.spyOn(t.git,'gotoBranch').mockResolvedValue(true)
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'1.7.0-dev.0'})

  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  jest.spyOn(t.git,'commitAll').mockResolvedValue(true)

  const res = await b.checkDevelopVersion()
  expect(spy.mock.calls[0][0]).toBe('1.7.0-dev.0')

})

test('checkDevelopVersion develop needs update but is noncommital', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('master')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.6.0',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValue(true)
  jest.spyOn(t.git,'gotoBranch').mockResolvedValue(true)
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.2.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  jest.spyOn(t.git,'commitAll').mockResolvedValue(true)

  const res = await b.checkDevelopVersion()
  expect(spy.mock.calls.length).toBe(0)
})

test('checkDevelopVersion develop needs update but is noncommital', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('master')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.6.0',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.git,'gotoDevelop').mockResolvedValue(true)
  jest.spyOn(t.git,'gotoBranch').mockResolvedValue(true)
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.8.3-dev.4',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  const spy = jest.spyOn(t.util,'bump').mockResolvedValueOnce(true)
  jest.spyOn(t.git,'commitAll').mockResolvedValue(true)

  const res = await b.checkDevelopVersion()
  expect(spy.mock.calls.length).toBe(0)
})

test('merge branch flow: completed release to master', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('release/1.5.0')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.4.0',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be master

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch


  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  const res = await b.mergeBranchFlow('master')
  expect(spy.mock.calls[0][0]).toBe('1.4.0')
  expect(spy.mock.calls[1][0]).toBe('1.5.0')
})

test('merge branch flow: incomplete release to master with abort', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('release/1.5.0')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-rc.5',isPreRelease:true,preReleaseId:'rc'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.4.0',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'Abort'})

  // these are just here for insurance in case something goes by that shouldn't.
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be master

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch


  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)
  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()


  const res = await b.mergeBranchFlow('master')
  expect(spy.mock.calls.length).toBe(0)
})

test('merge branch flow: incomplete release to master with continuation', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('release/1.5.0')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-rc.5',isPreRelease:true,preReleaseId:'rc'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.4.0',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'Keep Going'})
  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'continue'})

  // these are just here for insurance in case something goes by that shouldn't.
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be master

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch

  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)
  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  const res = await b.mergeBranchFlow('master')
  expect(spy.mock.calls[0][0]).toBe('1.4.0')
  expect(spy.mock.calls[1][0]).toBe('1.5.0')
  expect(spy.mock.calls[2][0]).toBe('1.5.0-rc.5')

})


test('merge branch flow: feature to develop, normal flow', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('feature/1.5.0-INST-123-my-fix')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-INST-123.3',isPreRelease:true,preReleaseId:'INST-123'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-dev.8',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be develop
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch


  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.util,'removeTargetBranch').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  const res = await b.mergeBranchFlow('develop')
  expect(spy.mock.calls[0][0]).toBe('1.5.0-dev.8')
  expect(spy.mock.calls[1][0]).toBe('1.5.0-dev.9')
  expect(spy.mock.calls[2][0]).toBe('1.5.0-INST-123.3')
})

test('merge branch flow: feature to develop, error path: nothing to commit', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('feature/1.5.0-INST-123-my-fix')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-INST-123.3',isPreRelease:true,preReleaseId:'INST-123'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-dev.8',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be develop
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockRejectedValueOnce(new Error('nothing to commit'))
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git push

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch


  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.util,'removeTargetBranch').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  const res = await b.mergeBranchFlow('develop')
  expect(spy.mock.calls[0][0]).toBe('1.5.0-dev.8')
  expect(spy.mock.calls[1][0]).toBe('1.5.0-dev.9')
  expect(spy.mock.calls[2][0]).toBe('1.5.0-INST-123.3')
})

test('merge branch flow: feature to develop, error path: actual problem or confict', async () => {
  jest.spyOn(t.git,'getCurBranchName').mockResolvedValueOnce('feature/1.5.0-INST-123-my-fix')
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-INST-123.3',isPreRelease:true,preReleaseId:'INST-123'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('aaa\nbbb\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValueOnce({version:'1.5.0-dev.8',isPreRelease:true,preReleaseId:'dev'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValueOnce(null)
  jest.spyOn(t.util,'getChangeLog').mockReturnValueOnce('ccc\n')

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)

  jest.spyOn(inquirer,'prompt').mockResolvedValueOnce({tempName:'SKIP'})

  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  // mergeTarget should be develop
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockRejectedValueOnce(new Error('darkness, envisioning me, all that I see, absolute horror.'))
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git push

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git checkout target
  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true) // git merge start branch


  const spy = jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.util,'addChangeLogLine').mockReturnValueOnce()
  jest.spyOn(t.util,'removeTargetBranch').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  jest.spyOn(b,'checkDevelopVersion').mockResolvedValueOnce()

  jest.spyOn(t.shell,'execVerbose').mockResolvedValueOnce(true)
  jest.spyOn(t.util,'setAllVersionData').mockReturnValueOnce()
  jest.spyOn(t.util,'setChangeLog').mockReturnValueOnce()
  jest.spyOn(t.git,'commitAll').mockResolvedValueOnce(true)

  const res = await b.mergeBranchFlow('develop')
  expect(spy.mock.calls[0][0]).toBe('1.5.0-dev.8')
})



})
