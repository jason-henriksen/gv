

import {ToolBoxClass} from '../../main/util/toolbox'
import inquirer, { DistinctQuestion } from 'inquirer'

describe('tool box operations', () => {

  let log = []

  beforeEach(() => {
    log=[]
  })

  afterEach(()=>{
    jest.clearAllMocks()
  })

test('constructor stuff', () => {

  const tb1 = new ToolBoxClass({},{})

  expect(tb1.global.requireCleanWorkingDir).toBeTruthy()
  expect(tb1.options.isDebug).toBeFalsy()
  expect(tb1.log).toBeTruthy()
  expect(tb1.shell).toBeTruthy()
  expect(tb1.spinner).toBeTruthy()
  expect(tb1.util).toBeTruthy()

})

test('test wrapper', () => {

  const tb1 = new ToolBoxClass({},{})

  tb1.resetOptions({isDebug:true})
  expect(tb1.options.isDebug).toBeTruthy()
  tb1.resetOptions()
  expect(tb1.options.isDebug).toBeFalsy()

  tb1.resetState({action:'test'})
  expect(tb1.state.action).toBe('test')
  tb1.resetState()
  expect(tb1.state.action).toBe('')

  tb1.setOptions({isDebug:true})
  expect(tb1.options.isDebug).toBeTruthy()

  tb1.setState({action:'test2'})
  expect(tb1.state.action).toBe('test2')
})

let recentAnswer = ''
const taskSample = async (answerVal) => {
  recentAnswer = answerVal
  return Promise.resolve()
}

const choiceMaker = () => {
  return ['a','b','c']
}


test('test prompts', async () => {
  const tb1 = new ToolBoxClass({},{})

  let spy = jest.spyOn(inquirer,'prompt')
  spy.mockResolvedValue({tempName:true})
  await tb1.prompt({prompt:{type:'confirm',message:'t1'},task:taskSample})
  expect(recentAnswer).toBe(true)

  spy.mockResolvedValue({tempName:false})
  recentAnswer = 'taskNotExecuted'
  await tb1.prompt({prompt:{type:'confirm',message:'t1'},task:taskSample})
  expect(recentAnswer).toBe('taskNotExecuted')

  spy.mockResolvedValue({tempName:'c'})
  await tb1.prompt({prompt:{type:'list',message:'t1',choices:['b','c','d']},task:taskSample})
  expect(recentAnswer).toBe('c')

  spy.mockResolvedValue({tempName:'a'})
  await tb1.prompt({prompt:{type:'list',message:'t1',choiceMaker:choiceMaker},task:taskSample})
  expect(recentAnswer).toBe('a')
})

test('test step', async () => {
  const tb1 = new ToolBoxClass({},{})

  jest.spyOn(tb1,'prompt').mockImplementation( async ()=>{
    return 'didPrompt'
  })
  jest.spyOn(tb1.spinner,'show').mockImplementation( async ()=>{
    return 'didSpinner'
  })

  tb1.setOptions({isCI:false})
  let testVal = await tb1.step({prompt:{type:'list',message:'t1',choiceMaker:choiceMaker},task:taskSample})
  expect(testVal).toBe('didPrompt')


  tb1.setOptions({isCI:true})
  testVal = await tb1.step({prompt:{type:'list',message:'t1',choiceMaker:choiceMaker},task:taskSample})
  expect(testVal).toBe('didSpinner')

})


})
