import CommandLineOptions from "../../types/command-line-options";
import PromptWrappedFunction from "../../types/prompt-wrapped-function";
declare class Spinner {
    isSpinnerDisabled: boolean;
    canForce: boolean;
    constructor(options: CommandLineOptions);
    show(params: PromptWrappedFunction): Promise<any>;
}
export default Spinner;
