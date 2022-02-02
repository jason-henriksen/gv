export declare class Branching {
    constructor(...args: any[]);
    init(): Promise<void>;
    startUI(): Promise<string>;
    doTask(task: any): Promise<void>;
    task_GoDevelop(): Promise<void>;
    task_GoCurRelease(): Promise<void>;
    task_BumpVersionManually(useMaster: boolean): Promise<void>;
    task_ReleaseBugFix(): Promise<void>;
    task_ReleasePatch(): Promise<void>;
    task_DevelopFeature(): Promise<void>;
    task_MasterFeature(): Promise<void>;
    task_DevelopRelease(): Promise<void>;
    task_BugMerge(target: any): Promise<void>;
    task_FeatureMergeToTarget(uiTarget: string, justAsk?: boolean): Promise<void>;
    task_FeatureAbandon(): Promise<void>;
    task_ReleaseAbandon(): Promise<void>;
    task_BugFixAbandon(): Promise<void>;
    task_ReleaseMergeToMaster(): Promise<void>;
    task_Repair(): Promise<void>;
    task_updateBranchFromDevelopFlow(): Promise<void>;
    mergeBranchFlow(mergeTarget: any, originalRCTarget?: string): Promise<void>;
    createBranchFlow(newBranch: string, newVersion: string, targetBranch?: string): Promise<void>;
    nameFeature(branchType: any): Promise<{
        jiraName: string;
        jiraDesc: string;
        newBranch: string;
    }>;
    checkDevelopVersion(): Promise<void>;
}
declare const _default: Branching;
export default _default;
