import { DistinctQuestion, Answers } from 'inquirer';
export declare type DistinctQuestionPlus<T extends Answers = Answers> = DistinctQuestion & {
    choiceMaker?: any;
};
