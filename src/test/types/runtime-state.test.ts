
import RuntimeState from '../../main/types/runtime-state'




describe('parameter management checks', () => {

test('empty const', () => {
  const clo = new RuntimeState()
  expect(clo.private).toBeFalsy()
  expect(clo.isUpdate).toBeFalsy()
})

test('full const', () => {
  const clo = new RuntimeState({private:true,isUpdate:true})
  expect(clo.private).toBeTruthy()
  expect(clo.isUpdate).toBeTruthy()
  expect(clo.isReleased).toBeFalsy()
})

test('setter', () => {
  const clo = new RuntimeState({private:true,isUpdate:true})
  clo.set({private:false,isReleased:true})
  expect(clo.private).toBeFalsy()
  expect(clo.isUpdate).toBeTruthy()
  expect(clo.isReleased).toBeTruthy()
})

test('resetter', () => {
  const clo = new RuntimeState({private:true,isUpdate:true})
  clo.reset({isReleased:true})
  expect(clo.private).toBeFalsy()
  expect(clo.isUpdate).toBeFalsy()
  expect(clo.isReleased).toBeTruthy()
})

test('empty setter', () => {
  const clo = new RuntimeState({private:true,isUpdate:true})
  clo.set()
  expect(clo.private).toBeTruthy()
  expect(clo.isUpdate).toBeTruthy()
  expect(clo.isReleased).toBeFalsy()
})

test('empty resetter', () => {
  const clo = new RuntimeState({private:true,isUpdate:true})
  clo.reset()
  expect(clo.private).toBeFalsy()
  expect(clo.isUpdate).toBeFalsy()
  expect(clo.isReleased).toBeFalsy()
})


})