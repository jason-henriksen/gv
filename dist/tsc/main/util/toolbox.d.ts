import Logger from './tools/logger';
import Shell from './tools/shell';
import Spinner from './tools/spinner';
import Util from './tools/util';
import PromptWrappedFunction from '../types/prompt-wrapped-function';
import CommandLineOptions from '../types/command-line-options';
import RuntimeState from '../types/runtime-state';
import GlobalConfig from '../types/global-config';
import { Branching } from '../task/branching';
import Git from './tools/git';
export declare class ToolBoxClass {
    readonly global: GlobalConfig;
    readonly options: CommandLineOptions;
    readonly state: RuntimeState;
    readonly log: Logger;
    readonly shell: Shell;
    readonly spinner: Spinner;
    readonly util: Util;
    readonly git: Git;
    branching: Branching;
    constructor(global?: Partial<GlobalConfig>, options?: Partial<CommandLineOptions>);
    resetOptions(input?: Partial<CommandLineOptions>): void;
    resetState(input?: Partial<RuntimeState>): void;
    setOptions(input: Partial<CommandLineOptions>): void;
    setState(input: Partial<RuntimeState>): void;
    prompt(params: PromptWrappedFunction): Promise<any>;
    step(params: PromptWrappedFunction): Promise<any>;
}
declare const tb: ToolBoxClass;
export default tb;
