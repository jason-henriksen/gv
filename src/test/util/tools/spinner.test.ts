

// import Shell from '../../../main/util/tools/shell'
import t, { ToolBoxClass } from '../../../main/util/toolbox'


describe('spinner tests', () => {


  beforeEach(() => {
  })

  afterEach(()=>{
    jest.clearAllMocks()
  })

test('basic calls ', async () => {

  let val = 0
  await t.spinner.show({enabled:false,task:()=>{val=1}})
  expect(val).toBe(0)

  await t.spinner.show({task:async ()=>{val=2},label:'asdf'})
  expect(val).toBe(2)

  t.spinner.isSpinnerDisabled=true
  t.spinner.canForce=false
  // still runs the task, just no spinner
  await t.spinner.show({task:async ()=>{val=3},label:'asdf'})
  expect(val).toBe(3)

  t.spinner.canForce=true
  await t.spinner.show({task:async ()=>{val=4},label:'asdf'})
  expect(val).toBe(4)

})


})
