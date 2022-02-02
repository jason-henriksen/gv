
import { DistinctQuestion, Answers } from 'inquirer'

/* @ts-ignore */
export type DistinctQuestionPlus<T extends Answers = Answers> = DistinctQuestion & {
  choiceMaker?: any
}