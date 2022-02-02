import fs, { PathLike } from 'fs'
import t from '../../../main/util/toolbox'
import Util from '../../../main/util/tools/util'

// DO mock fs for these tests
jest.mock('fs')

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

test('immediate calls', async ()=>{
  const tutil = new Util()
  jest.spyOn(fs,'readFileSync').mockImplementationOnce( ()=>{
    throw new Error('sadness')}
  )
  const cl = tutil.getChangeLog()
  expect(cl).toBe('')
})


test('change log', async ()=>{
  jest.spyOn(fs,'writeFileSync').mockReturnValue()
  t.util.addChangeLogLine('a1')

  jest.spyOn(fs,'readFileSync').mockImplementationOnce(
    (path)=>{
      if(path.toString()==='./CHANGELOG.md'){
        throw new Error('pop')
      }
      return new Buffer('asdf')
    }
  )
  t.util.addChangeLogLine('a1')
})

test('getInitials', async ()=>{
  // happy
  jest.spyOn(fs,'readFileSync').mockImplementationOnce(
    ()=>{
      return new Buffer('jh')
    }
  )
  expect(t.util.getInitials()).toBe('JH/')

  jest.spyOn(fs,'readFileSync').mockImplementation(()=>{ throw new Error('splat')})
  expect(t.util.getInitials()).toBe('')
})



})
