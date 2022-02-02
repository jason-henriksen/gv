export declare class Util {
    constructor();
    getSystemInfo(): {
        'cc-flow': string;
        node: string;
        os: string;
    };
    clean(args: any): any;
    format(template?: string, context?: {}): any;
    parseGitUrl(remoteUrl: any): {
        host: any;
        owner: any;
        project: any;
        protocol: any;
        remote: any;
        repository: string;
    };
    hasAccess(path: any): boolean;
    getImmediateVersion(): {
        version?: undefined;
        isPreRelease?: undefined;
        preReleaseId?: undefined;
    } | {
        version: string;
        isPreRelease: boolean;
        preReleaseId: any;
    };
    getImmediateTargetBranch(): any;
    setAllVersionData(version: string, branchTarget?: string): void;
    setTargetBranch(targetBranch: string): void;
    getTargetBranch(): string;
    removeTargetBranch(): void;
    bump(version: string): Promise<any>;
    parseVersion(raw: string): {
        version?: undefined;
        isPreRelease?: undefined;
        preReleaseId?: undefined;
    } | {
        version: string;
        isPreRelease: boolean;
        preReleaseId: any;
    };
    removeVersionPreReleasePart(curVer: string): string;
    getChangeLog(): string;
    setChangeLog(targetCL: string, branchCL?: string): void;
    branchWarning(): Promise<void>;
    addChangeLogLine(msg: string): void;
    getInitials(): string;
}
export default Util;
