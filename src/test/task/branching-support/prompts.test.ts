
import sut from '../../../main/task/branching-support/prompts'
import {makeVersionBumpChoices} from '../../../main/task/branching-support/prompts'
import poc from '../../../main/task/branching-support/prompt-option-constants'
import t from '../../../main/util/toolbox'

describe('exercise the options builder', () => {

  beforeEach(() => {
  })

  afterEach(()=>{
    jest.clearAllMocks()
  })

test('make target choices', () => {

  t.setState({curBranch:'master'})
  expect(sut.targets.choiceMaker().length).toBe(5)

  t.setState({curBranch:'develop'})
  expect(sut.targets.choiceMaker().length).toBe(5)

  t.setState({curBranch:'bugfix'})
  expect(sut.targets.choiceMaker().length).toBe(7)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3-rc.4',isPreRelease:true,preReleaseId:'rc'})
  t.setState({curBranch:'release'})
  expect(sut.targets.choiceMaker().length).toBe(6)

  jest.spyOn(t.util,'getImmediateVersion').mockReturnValue({version:'1.2.3',isPreRelease:false,preReleaseId:''})
  t.setState({curBranch:'release'})
  expect(sut.targets.choiceMaker().length).toBe(5)

  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue('master')
  t.setState({curBranch:'feature'})
  expect(sut.targets.choiceMaker().length).toBe(7)
  expect(sut.targets.choiceMaker()[0]).toBe(poc.FEATURE_MERGE_TO_MASTER)

  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue('develop')
  t.setState({curBranch:'feature'})
  expect(sut.targets.choiceMaker().length).toBe(7)
  expect(sut.targets.choiceMaker()[0]).toBe(poc.FEATURE_MERGE_TO_DEVELOP)

  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue(null)
  t.setState({curBranch:'feature'})
  expect(sut.targets.choiceMaker().length).toBe(8)
  expect(sut.targets.choiceMaker()[0]).toBe(poc.FEATURE_MERGE_TO_DEVELOP)
  expect(sut.targets.choiceMaker()[1]).toBe(poc.FEATURE_MERGE_TO_MASTER)

  jest.spyOn(t.util,'getImmediateTargetBranch').mockReturnValue('release/1.2.3')
  t.setState({curBranch:'feature'})
  expect(sut.targets.choiceMaker().length).toBe(6)
  expect(sut.targets.choiceMaker()[0]).toBe(poc.FEATURE_MERGE_TO_SPECIFIC)

  t.setState({curBranch:'utter-nonsense'})
  expect(sut.targets.choiceMaker().length).toBe(3)

  t.setState({curBranch:null})
  expect(sut.targets.choiceMaker().length).toBe(5)


})

test('make target choices', () => {

  t.setState({curBranch:'master'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(3)

  t.setState({curBranch:'develop'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(4)

  t.setState({curBranch:'bug'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(5)

  t.setState({curBranch:'feature'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(2)

  t.setState({curBranch:'release'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(6)

  t.setState({curBranch:'nonsense'})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(5)

  t.setState({curBranch:null})
  expect(makeVersionBumpChoices('1.2.3').length).toBe(3)


})

})