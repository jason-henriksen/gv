

import * as errList from '../../../main/util/tools/errors'

describe('error allocations', () => {

  beforeEach(() => {
  })

  afterEach(()=>{
  })

test('constructor stuff', () => {

  const e1 = new errList.CCFlowError()

  const e2 = new errList.CCFlowError('asdf')
  expect(e2.message).toBe('asdf')

  const e3 = new errList.TimeoutError()
  const e4 = new errList.GitCommitError()
  const e5 = new errList.GitHubClientError()

  let err = new errList.InvalidVersionError()
  expect(err.message).toBe('An invalid version was provided.')

  err = new errList.InvalidConfigurationError('path')
  expect(/file at path/.test(err.message)).toBeTruthy()

  err = new errList.GitRemoteUrlError()
  expect(/Could not get/.test(err.message)).toBeTruthy()

  err = new errList.GitRequiredBranchError('zzz')
  expect(/Must be on branch zzz/.test(err.message)).toBeTruthy()

  err = new errList.GitCleanWorkingDirError()
  expect(/must be clean/.test(err.message)).toBeTruthy()

  err = new errList.GitUpstreamError()
  expect(/No upstream/.test(err.message)).toBeTruthy()

  err = new errList.GitNoCommitsError()
  expect(/no commits/.test(err.message)).toBeTruthy()

  err = new errList.GitNetworkError('err','remote')
  expect(/Unable to fetch/.test(err.message)).toBeTruthy()

  err = new errList.TokenError('type','token')
  expect(/variable "token" is required for type/.test(err.message)).toBeTruthy()

})

})
