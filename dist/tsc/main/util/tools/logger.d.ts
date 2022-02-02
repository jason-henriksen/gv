declare class Logger {
    constructor();
    silentForTest: boolean;
    log(...args: any[]): void;
    error(...args: any[]): void;
    info(...args: any[]): void;
    obtrusive(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
    verbose(...args: any[]): void;
}
export default Logger;
