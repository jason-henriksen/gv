import { EOL } from 'os'

export class CCFlowError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TimeoutError extends CCFlowError {}

export class GitCommitError extends CCFlowError {}

export class GitHubClientError extends CCFlowError {}

export class InvalidVersionError extends CCFlowError {
  constructor() {
    super('An invalid version was provided.');
  }
}

export class InvalidConfigurationError extends CCFlowError {
  constructor(filePath) {
    super(`Invalid configuration file at ${filePath}`);
  }
}

export class GitRemoteUrlError extends CCFlowError {
  constructor() {
    super('Could not get remote Git url.' + EOL + 'Please add a remote repository.');
  }
}

export class GitRequiredBranchError extends CCFlowError {
  constructor(requiredBranches) {
    super(`Must be on branch ${requiredBranches}`);
  }
}

export class GitCleanWorkingDirError extends CCFlowError {
  constructor() {
    super(
      'Working dir must be clean.' +
        EOL +
        'Please stage and commit your changes.' +
        EOL +
        'Alternatively, use `--no-git.requireCleanWorkingDir` to include the changes in the release commit' +
        ' (or save `"git.requireCleanWorkingDir": false` in the configuration).'
    );
  }
}

export class GitUpstreamError extends CCFlowError {
  constructor() {
    super(
      'No upstream configured for current branch.' +
        EOL +
        'Please set an upstream branch.' +
        EOL +
        'Alternatively, use `--no-git.requireUpstream` to have this set this by release-it' +
        ' (or save `"git.requireUpstream": false` in the configuration).'
    );
  }
}

export class GitNoCommitsError extends CCFlowError {
  constructor() {
    super('There are no commits since the latest tag.');
  }
}

export class GitNetworkError extends CCFlowError {
  constructor(err, remoteUrl) {
    super(`Unable to fetch from ${remoteUrl}${EOL}${err.message}`);
  }
}


export class TokenError extends CCFlowError {
  constructor(type, tokenRef) {
    super(
      `Environment variable "${tokenRef}" is required for ${type} releases.` +
        EOL +
        `Documentation: https://github.com/release-it/release-it#${type.toLowerCase()}-releases`
    );
  }
}
