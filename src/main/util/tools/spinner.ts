import CommandLineOptions from "../../types/command-line-options";
import PromptWrappedFunction from "../../types/prompt-wrapped-function";
import t from '../toolbox'

import {oraPromise} from 'ora'

const noop = Promise.resolve();

class Spinner {

  isSpinnerDisabled:boolean
  canForce:boolean

  constructor(options:CommandLineOptions) {
    this.isSpinnerDisabled = options.isCI || options.isVerbose || options.isDryRun
    this.canForce = !options.isCI && !options.isVerbose && !options.isDryRun
  }

  async show(params:PromptWrappedFunction) {
    if (params.enabled===false) return noop;
    const awaitTask = params.task('not-supplied');
    if (!this.isSpinnerDisabled || this.canForce) {
      const text = t.util.format(params.label, params.context);

      return oraPromise(awaitTask, {
        text:text,
      })
    }
    else{
      return awaitTask;
    }
  }
}

export default Spinner
