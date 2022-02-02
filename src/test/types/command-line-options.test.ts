
import CommandLineOptions from '../../main/types/command-line-options'




describe('parameter management checks', () => {

test('empty const', () => {
  const clo = new CommandLineOptions()
  expect(clo.isDryRun).toBeFalsy()
  expect(clo.isVerbose).toBeFalsy()
})

test('full const', () => {
  const clo = new CommandLineOptions({isDryRun:true,isVerbose:true})
  expect(clo.isDryRun).toBeTruthy()
  expect(clo.isVerbose).toBeTruthy()
  expect(clo.isDebug).toBeFalsy()
})

test('setter', () => {
  const clo = new CommandLineOptions({isDryRun:true,isVerbose:true})
  clo.set({isDryRun:false,isDebug:true})
  expect(clo.isDryRun).toBeFalsy()
  expect(clo.isVerbose).toBeTruthy()
  expect(clo.isDebug).toBeTruthy()
})

test('resetter', () => {
  const clo = new CommandLineOptions({isDryRun:true,isVerbose:true})
  clo.reset({isDebug:true})
  expect(clo.isDryRun).toBeFalsy()
  expect(clo.isVerbose).toBeFalsy()
  expect(clo.isDebug).toBeTruthy()
})

test('empty setter', () => {
  const clo = new CommandLineOptions({isDryRun:true,isVerbose:true})
  clo.set()
  expect(clo.isDryRun).toBeTruthy()
  expect(clo.isVerbose).toBeTruthy()
  expect(clo.isDebug).toBeFalsy()
})

test('empty resetter', () => {
  const clo = new CommandLineOptions({isDryRun:true,isVerbose:true})
  clo.reset()
  expect(clo.isDryRun).toBeFalsy()
  expect(clo.isVerbose).toBeFalsy()
  expect(clo.isDebug).toBeFalsy()
})


})