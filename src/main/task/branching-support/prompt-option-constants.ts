
import chalk from 'chalk'

const propmtOptionConstants = Object.freeze({
  MASTER_FEATURE:           chalk.bold.white('Start a Master Feature:') +` name and create feature branch... ( ${chalk.bold.yellow('GitHubFlow Only')} )`,
  DEVELOP_FEATURE:          chalk.bold.white('Start a Feature:') +' name and create feature branch...',
  DEVELOP_RELEASE:          chalk.bold.white('Start a Release:') +' create a release branch...',
  RELEASE_BUGFIX:           chalk.bold.white('Start a BugFix:') +' create a bugfix branch to fix this pre-release branch... ( for defects found before a release )',
  RELEASE_PATCH:            chalk.bold.white('Start a Patch: ') +' create a patch branch to become a new hotfix release... ( for defects found after a release )',

  BUG_MERGE_MASTER:         chalk.bold.white('Complete:') +` merge fix to master, bump versions and prep for release... ( ${chalk.bold.yellow('GitHubFlow Only')} )`,
  BUG_MERGE_RELEASE:        chalk.bold.white('Complete:') +' merge fix to a release branch and bump release candidate version...',
  FEATURE_MERGE_TO_MASTER:  chalk.bold.white('Complete:') +` merge feature to master, bump version and prep for release... ( ${chalk.bold.yellow('GitHubFlow Only')} )`,
  FEATURE_MERGE_TO_DEVELOP: chalk.bold.white('Complete:') +' merge feature to develop...',
  FEATURE_MERGE_TO_SPECIFIC:chalk.bold.white('Propagate:')+' merge feature to a branch you will supply...',
  RELEASE_MERGE_TO_MASTER:  chalk.bold.white('Complete:') +' merge release to master for release...',
  // FEATURE_PR_TRAIL: chalk.bold.white('Incremental PR:') +' create a trail of small pull requests for incremental review...',

  REPAIR_BRANCH:            chalk.bold.white('Repair:')+' fix a bad branch name...',
  GOTO_DEVELOP:             chalk.bold.white('Move:') +' to the develop branch... ( where you can create new feature releases )',
  GOTO_MASTER_RELEASE:        chalk.bold.white('Move:') +' to release branch that is currently on master... ( where you can create new patch releases )',
  CANCEL:                   chalk.bold.white('Cancel') ,
  BUMP_MANUAL:              chalk.bold.white('Version:')    +` Increment part of the version number manually... ( ${chalk.bold.yellow('Repairs Only')}: Normally happens automatically.  This lets you fix mistakes. )`,
  BUMP_AUTO:                chalk.bold.white('AutoVersion:')+` Increment version number based on master...      ( ${chalk.bold.yellow('Repairs Only')}: Normally happens automatically.  This lets you fix mistakes. )`,

  BRANCH_UPDATE: chalk.bold.white('Update:') +' merge changes from develop to this branch...',
  FEATURE_ABANDON: chalk.bold.white('Abandon:') +' delete this feature branch...',
  RELEASE_ABANDON: chalk.bold.white('Abandon:') +' delete this release branch...',
  BUGFIX_ABANDON: chalk.bold.white('Abandon:') +' delete this bug fix branch and return to develop...',  // for release bugs

  FEATURE_UPDATE: chalk.bold('Feature Update') +' WHAT IS THIS DO? this Feature: Delete this feature branch...',

  TASK_COMPLETE: chalk.bold('Task Completed'), // for one system letting the other systems know that the work is done.
  TASK_NEEDS_FINAL_COMMIT: chalk.bold('Needs commits after changes'), // for one system letting the other systems know that the work is done.

  DIVIDER: chalk.grey('---'), // for one system letting the other systems know that the work is done.

  MAJOR: chalk.bold.white('major:') +' 1.0.0             ( breaking changes )',
  MINOR: chalk.bold.white('minor:') +' 0.1.0             ( non-breaking changes )',
  FIX: chalk.bold.white('patch:') +' 0.0.1             ( production fixes only )',
  PRE: chalk.bold.white('pre:') +  ' 0.0.0-(dev||rc).1 ( pre-release builds )',


})

export default propmtOptionConstants