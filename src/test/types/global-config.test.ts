
import GlobalConfig from '../../main/types/global-config'

describe('parameter management checks', () => {

test('empty const', () => {
  const clo = new GlobalConfig()
  expect(clo.requireBranch).toBeFalsy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
})

test('full const', () => {
  const clo = new GlobalConfig({requireBranch:true,requireCleanWorkingDir:true})
  expect(clo.requireBranch).toBeTruthy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
  expect(clo.requireCommits).toBeFalsy()
})

test('setter', () => {
  const clo = new GlobalConfig({requireBranch:true,requireCleanWorkingDir:true})
  clo.set({requireBranch:false,requireCommits:true})
  expect(clo.requireBranch).toBeFalsy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
  expect(clo.requireCommits).toBeTruthy()
})

test('resetter', () => {
  const clo = new GlobalConfig({requireBranch:true,requireCleanWorkingDir:true})
  clo.reset({requireCommits:true})
  expect(clo.requireBranch).toBeFalsy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
  expect(clo.requireCommits).toBeTruthy()
})

test('empty setter', () => {
  const clo = new GlobalConfig({requireBranch:true,requireCleanWorkingDir:true})
  clo.set()
  expect(clo.requireBranch).toBeTruthy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
  expect(clo.requireCommits).toBeFalsy()
})

test('empty resetter', () => {
  const clo = new GlobalConfig({requireBranch:true,requireCleanWorkingDir:true})
  clo.reset()
  expect(clo.requireBranch).toBeFalsy()
  expect(clo.requireCleanWorkingDir).toBeTruthy()
  expect(clo.requireCommits).toBeFalsy()
})


})