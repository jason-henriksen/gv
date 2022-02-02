declare class Task {
    init(): void;
    getName(): string;
    getLatestVersion(): string;
    getChangelog(): string;
    getIncrementedVersionCI(values?: any): string;
    getIncrementedVersion(values?: any): string;
    beforeBump(values?: any): string;
    bump(values?: any): any;
    beforeRelease(values?: any): string;
    release(values?: any): Promise<any>;
    afterRelease(): void;
    runTasks(): Promise<{
        name: string;
        latestVersion: string;
        version: any;
    }>;
}
export default Task;
