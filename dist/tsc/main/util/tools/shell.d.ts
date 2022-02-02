import Logger from './logger';
declare class Shell {
    log: Logger;
    constructor(logVal: Logger);
    beLoud(): void;
    beSilent(): void;
    execVerbose(cmd: string): Promise<any>;
    exec(command: string): Promise<any>;
}
export default Shell;
