export declare class CCFlowError extends Error {
    constructor(...args: any[]);
}
export declare class TimeoutError extends CCFlowError {
}
export declare class GitCommitError extends CCFlowError {
}
export declare class GitHubClientError extends CCFlowError {
}
export declare class InvalidVersionError extends CCFlowError {
    constructor();
}
export declare class InvalidConfigurationError extends CCFlowError {
    constructor(filePath: any);
}
export declare class GitRemoteUrlError extends CCFlowError {
    constructor();
}
export declare class GitRequiredBranchError extends CCFlowError {
    constructor(requiredBranches: any);
}
export declare class GitCleanWorkingDirError extends CCFlowError {
    constructor();
}
export declare class GitUpstreamError extends CCFlowError {
    constructor();
}
export declare class GitNoCommitsError extends CCFlowError {
    constructor();
}
export declare class GitNetworkError extends CCFlowError {
    constructor(err: any, remoteUrl: any);
}
export declare class TokenError extends CCFlowError {
    constructor(type: any, tokenRef: any);
}
