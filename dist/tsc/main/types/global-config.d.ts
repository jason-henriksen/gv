export declare enum GitStyle {
    any = "any",
    git = "git",
    github = "github"
}
declare class GlobalConfig {
    requireBranch?: boolean;
    requireBranchList?: Array<string>;
    requireCleanWorkingDir?: boolean;
    requireUpstream?: boolean;
    requireCommits?: boolean;
    gitStyle: GitStyle;
    constructor(values?: Partial<GlobalConfig>);
    set(values?: Partial<GlobalConfig>): void;
    reset(values?: Partial<GlobalConfig>): void;
}
export default GlobalConfig;
