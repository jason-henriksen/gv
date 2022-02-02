

// import Shell from '../../../main/util/tools/shell'
import t, { ToolBoxClass } from '../../../main/util/toolbox'


describe('group 1', () => {


  beforeEach(() => {
  })

  afterEach(()=>{
    jest.clearAllMocks()
  })

test('basic calls ', async () => {

  let logSpyList = []
  let logSpyListDbg = []
  let logSpyListErr = []

  jest.spyOn(console, 'log').mockImplementation((...msg) => { logSpyList.push(msg) })
  jest.spyOn(console, 'debug').mockImplementation((...msg) => { logSpyListDbg.push(msg) })
  jest.spyOn(console, 'error').mockImplementation((...msg) => { logSpyListErr.push(msg) })

  t.shell.exec('')

  const here = process.cwd()
  const there = await t.shell.exec('pwd')
  expect(here).toBe(there)

  jest.spyOn(t.spinner, 'show').mockResolvedValue('ok')
  const checkVerbose = await t.shell.execVerbose('do nothing')
  expect(checkVerbose).toBe('ok')

})

})

describe('group 2', () => {

test('check errors', async () => {

  let logSpyList = []
  let logSpyListDbg = []
  let logSpyListErr = []

  jest.spyOn(console, 'log').mockImplementation((...msg) => { logSpyList.push(msg) })
  jest.spyOn(console, 'debug').mockImplementation((...msg) => { logSpyListDbg.push(msg) })
  jest.spyOn(console, 'error').mockImplementation((...msg) => { logSpyListErr.push(msg) })

  const t2 = new ToolBoxClass()

  try{
    const there = await t2.shell.exec('git checkout nonExistantBranch')
  }
  catch(err){
    expect(/did not match/.test(err.message)).toBe(true)
    // expect(/did not match/.test(logSpyListErr[0][1])).toBe(true) // no longer auto logging stderr
    // doing so messes up the UI.
  }

  logSpyList = []
  logSpyListDbg = []
  logSpyListErr = []

  jest.spyOn(t.spinner, 'show').mockImplementation( async (params) =>{
    params.task('na')
  } )
  const msg = await t2.shell.execVerbose('git status')
  // expect(/On branch/.test(msg)).toBe(true)

  try{
    t2.shell.beLoud()
    t2.shell.beSilent()
    const there = await t2.shell.exec('git checkout nonExistantBranch')
  }
  catch(err){
    console.log(err)
    expect(/did not match/.test(err.message)).toBe(true)
    // expect(/did not match/.test(logSpyListErr[0][1])).toBe(true)  // no longer auto logging stderr
    // doing so messes up the UI.
  }

})


test('how do awaits work in Node', async ()=>{

  let sharedVal = 0

  const addSix = async ()=>{
    sharedVal+=3                      // the quick part
    await t.shell.exec('git status')  // the waiting part
    sharedVal+=3                      // the later part
  }

  const promiseArray = [addSix(), addSix(), addSix()]

  expect(sharedVal).toBe(9)        // NOT ZERO!  The promises have already started!
  await Promise.all(promiseArray); // This just waits till they finish.
  expect(sharedVal).toBe(18)       // but this was delayed on the work

})



})
