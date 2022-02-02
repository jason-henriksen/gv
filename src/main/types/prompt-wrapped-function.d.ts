
import { DistinctQuestion } from 'inquirer'

export default interface PromptWrappedFunction{
  prompt?: DistinctQuestion
  task: (value:any)=>any
  external?:boolean
  enabled?:boolean
  isCI?:boolean // used to override the cli options
  context?:any
  label?:string
  message?:string
}
