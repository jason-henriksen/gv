export declare const prompts: {
    tag: any;
    push: any;
    reviewLog: any;
    gotoBranchCheck: any;
    prTrailName: any;
};
declare class Git {
    constructor(...args: any[]);
    newTrail: string;
    defTrail: string;
    remoteUrl: string;
    init(): Promise<void>;
    isRequiredBranch(): Promise<any>;
    hasUpstreamBranch(): Promise<boolean>;
    isWorkingDirClean(): Promise<boolean>;
    getCurBranchName(): Promise<string>;
    fetch(): Promise<any>;
    gotoDevelop(): Promise<boolean>;
    gotoMaster(): Promise<boolean>;
    gotoBranch(branchName: any): Promise<boolean>;
    gotoDevelopOrMaster(): Promise<boolean>;
    makeBranch(newBranch: any): Promise<void>;
    deleteBranch(curBranch: any): Promise<boolean>;
    setOrigin(newBranch: any): Promise<boolean>;
    reNameBranch(newBranch: any, oldBranch: any): Promise<boolean>;
    commitAll(msg?: string): Promise<boolean>;
    afterBranch(branch: string, version: string, msg?: string, targetBranch?: string): Promise<boolean>;
}
export default Git;
