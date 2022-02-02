
import { main, parseCliArguments } from '../main/main'

import t from '../main/util/toolbox'



describe('parameter management checks', () => {

test('check cli nonsense', () => {
  const parse = parseCliArguments('ccflow --a=1 -b=2 c=3 4'.split(' '))
  expect(parse.a).toBe('1')
  expect(parse.b).toBe('2')
  expect(parse.c).toBeFalsy()
})

test('check cli config', () => {
  const parse = parseCliArguments('ccflow --a=1 -b=2 --config=3 4'.split(' '))
  expect(parse.a).toBe('1')
  expect(parse.b).toBe('2')
  expect(parse.c).toBe('3')
  expect(parse.config).toBe('3')
})

test('check cli aliases', () => {
  const parse = parseCliArguments('ccflow --dry-run=true --ci=true'.split(' '))
  expect(parse.d).toBe(true)
  expect(parse.ci).toBe(true)
})

test('check cli false boolean aliases', () => {
  const parse = parseCliArguments('ccflow --dry-run=false --ci=false'.split(' '))
  expect(parse.d).toBe(false)
  expect(parse.ci).toBe(false)
})

test('check cli verbose 1', () => {
  const parse = parseCliArguments('ccflow --verbose=true'.split(' '))
  expect(parse.verbose).toBe(true)
})

test('check cli verbose 2', () => {
  const parse = parseCliArguments('ccflow --verbose=IHAVENOIDEA'.split(' '))
  expect(parse.verbose).toBe(false)
})

})

describe('run through main', () => {

  let log = []

  beforeEach(() => {
    log=[]
    jest.spyOn(t.git,'init').mockResolvedValue()
    jest.spyOn(t.branching,'init').mockResolvedValue()
    jest.spyOn(t.branching,'startUI').mockResolvedValue('none')
    jest.spyOn(t.branching,'doTask').mockResolvedValue()
    jest.spyOn(t.log,'info').mockImplementation( (...args)=>{
      log.push(args)
    } )
    jest.spyOn(t.log,'log').mockImplementation( (...args)=>{
      log.push(args)
    } )
    jest.spyOn(t.log,'error').mockImplementation( (...args)=>{
      log.push(args)
    } )
  })

  afterEach(()=>{
    jest.clearAllMocks()
  })

  test('check the start and end log messages', async () => {
    await main()
    expect(log.length).toBe(2)
  })

  test('check the catch path', async() => {
    jest.spyOn(t.git,'init').mockImplementation( ()=>{
      throw new Error('test failure')
    } )
    await main()
    expect(log.length).toBe(3)
    expect(log[1][0]).toBe('test failure')
  })

})
