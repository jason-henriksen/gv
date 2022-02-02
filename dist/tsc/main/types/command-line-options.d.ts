declare class CommandLineOptions {
    readonly isDryRun?: boolean;
    readonly isCI?: boolean;
    readonly isVerbose?: boolean;
    readonly isDebug?: boolean;
    readonly verbosityLevel?: number;
    readonly ignoreVersion?: boolean;
    readonly write?: boolean;
    readonly external?: boolean;
    readonly publish?: boolean;
    readonly skipChecks?: boolean;
    readonly jiraId?: string;
    readonly jiraText?: string;
    constructor(values?: Partial<CommandLineOptions>);
    set(values?: Partial<CommandLineOptions>): void;
    reset(values?: Partial<CommandLineOptions>): void;
}
export default CommandLineOptions;
