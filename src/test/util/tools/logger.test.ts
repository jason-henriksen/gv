

import t from '../../../main/util/toolbox'

describe('error allocations', () => {

  let logSpyList = []
  let logSpyListDbg = []
  let logSpyListErr = []

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation((...msg) => { logSpyList.push(msg) })
    jest.spyOn(console, 'debug').mockImplementation((...msg) => { logSpyListDbg.push(msg) })
    jest.spyOn(console, 'error').mockImplementation((...msg) => { logSpyListErr.push(msg) })

  })

  afterEach(()=>{
  })

test('constructor stuff', () => {

  t.log.log()
  t.log.log('asdf')
  t.log.log('asdf','asdf')
  t.log.error('error')
  t.log.info('info')
  t.log.obtrusive('obtrus')
  t.log.warn('warn')

  t.log.debug('skipped debug')
  t.setOptions({isDebug:true})
  t.log.debug('debug')

  t.log.verbose('skipped debug')
  t.setOptions({isVerbose:true})
  t.log.verbose('verbose')

  expect(logSpyList[0].length).toBe(0)
  expect(logSpyList[1][0]).toBe('asdf')
  expect(logSpyList[2][1]).toBe('asdf')
  expect(logSpyList[3][0]).toBe("\u001b[90minfo\u001b[39m")
  expect(logSpyList[4][1]).toBe("obtrus")
  expect(logSpyList[5][1]).toBe("warn")
  expect(logSpyList[6][1]).toBe("debug")
  expect(logSpyList[7][1]).toBe("verbose")

  expect(logSpyListErr[0][1]).toBe("error")

})

})
