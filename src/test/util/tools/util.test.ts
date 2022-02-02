import fs from 'fs'
import t from '../../../main/util/toolbox'
import Util from '../../../main/util/tools/util'

// do NOT mock fs for these tests

describe('util tests', () => {


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

test('basic calls ', async () => {

  t.util.getSystemInfo()

  const ca = t.util.clean(['a',null,'b'])
  expect(ca[1]).toBe('b')

  t.util.format()
  t.util.format('asdf')

  var compiled = t.util.format('hello <%= user %>!',{ user: 'fred' });
  expect(compiled).toBe('hello fred!')

  try{
    var compiled = t.util.format('hello <%= user %>!',{ fred: 'user' });
    expect(false).toBe(true)
  }
  catch(err){
  }

})

test('git parse', async ()=>{
  t.util.parseGitUrl('')

  t.util.parseGitUrl('https://github.com/cameronmcnz/rock-paper-scissors.git')
  t.util.parseGitUrl('git@github.com:cameronmcnz/rock-paper-scissors.git')

  const repo2 = t.util.parseGitUrl('/Users/john/doe/owner/project')
  expect(repo2).toMatchObject({
    host: '',
    owner: 'owner',
    project: 'project',
    protocol: 'file',
    remote: '/Users/john/doe/owner/project',
    repository: 'owner/project'
  });
})

test('file access', async ()=>{
  expect(t.util.hasAccess('./package.json')).toBeTruthy()

  expect(t.util.hasAccess('/evil.evil.evil.json')).toBeFalsy()
})

test('immediate calls', async ()=>{

  const tutil = new Util()
  tutil.getImmediateVersion()

  tutil.getImmediateTargetBranch()

  jest.spyOn(fs,'writeFileSync').mockReturnValue()
  tutil.setAllVersionData('1.2.3','master')

  tutil.setAllVersionData('1.2.3')

  tutil.removeTargetBranch()

  tutil.setChangeLog('asdf-target')
  tutil.setChangeLog('asdf-target','asdf-branch')

  jest.spyOn(fs,'writeFileSync').mockImplementation( ()=>{ throw new Error('sadness')})

  try{
    tutil.setChangeLog('asdf-target')
    expect(true).toBe(false)
  }
  catch(err){}

})

test('version', async ()=>{

  t.util.parseVersion('')

  const ver = t.util.parseVersion('1.2.3-rc.4')
  expect(ver.version).toBe('1.2.3-rc.4')
  expect(ver.isPreRelease).toBe(true)
  expect(ver.preReleaseId).toBe('rc')

  const ver2 = t.util.parseVersion('garbage')
  expect(ver2).toMatchObject({})

  const ver3 = t.util.removeVersionPreReleasePart('1.2.3-rc.4')
  expect(ver3).toBe('1.2.3')

  const ver4 = t.util.removeVersionPreReleasePart('1.2.3')
  expect(ver4).toBe('1.2.3')

})

test('warning', async ()=>{
  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-rc.0',isPreRelease:true,preReleaseId:'rc'})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue('release/1.2.3')
  await t.util.branchWarning()

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:null})
  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue('release/1.2.3')
  await t.util.branchWarning()
})


test('target branch', async ()=>{
  // coverage only.   Just reads a file and CRUDS a value on it.
  // pops if there's a problem
  jest.spyOn(fs,'writeFileSync').mockReturnValue()
  t.util.setTargetBranch('asdf')
  t.util.getTargetBranch()
  t.util.removeTargetBranch()
})

test('bump', async ()=>{
  // happy
  jest.spyOn(t.shell,'exec').mockResolvedValue('ok')
  await t.util.bump('asdf')
  // sad 1
  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('hey version not changed here'))
  await t.util.bump('asdf')
  // sad 2
  jest.spyOn(t.shell,'exec').mockRejectedValue(new Error('dont know what happened'))
  expect(await t.util.bump('asdf')).toBeFalsy()
})


})
