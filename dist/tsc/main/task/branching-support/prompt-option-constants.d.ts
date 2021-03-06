declare const propmtOptionConstants: Readonly<{
    MASTER_FEATURE: string;
    DEVELOP_FEATURE: string;
    DEVELOP_RELEASE: string;
    RELEASE_BUGFIX: string;
    RELEASE_PATCH: string;
    BUG_MERGE_MASTER: string;
    BUG_MERGE_RELEASE: string;
    FEATURE_MERGE_TO_MASTER: string;
    FEATURE_MERGE_TO_DEVELOP: string;
    FEATURE_MERGE_TO_SPECIFIC: string;
    RELEASE_MERGE_TO_MASTER: string;
    REPAIR_BRANCH: string;
    GOTO_DEVELOP: string;
    GOTO_MASTER_RELEASE: string;
    CANCEL: string;
    BUMP_MANUAL: string;
    BUMP_AUTO: string;
    BRANCH_UPDATE: string;
    FEATURE_ABANDON: string;
    RELEASE_ABANDON: string;
    BUGFIX_ABANDON: string;
    FEATURE_UPDATE: string;
    TASK_COMPLETE: string;
    TASK_NEEDS_FINAL_COMMIT: string;
    DIVIDER: string;
    MAJOR: string;
    MINOR: string;
    FIX: string;
    PRE: string;
}>;
export default propmtOptionConstants;
