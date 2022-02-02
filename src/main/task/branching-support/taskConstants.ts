
const taskConstants = Object.freeze({

  'start.bugfix' : 'start a bugfix branch',
  'start.feature': 'start a feature branch',
  'start.release': 'start a release branch',

  'merge.to.develop': 'merge this branch to develop',
  'merge.from.develop': 'merge develop to this branch',
  'merge.release': 'merge this branch to the parent release',
  'merge.master': 'merge this branch to master',

  'fix': 'fix this branch name',
  'update.version': 'manually update the develop version number',
  'update.build': 'manually update the feature build number',
  'abandon.branch': 'abandon this branch',

  BUGFIX:'start.bugfix',
  FEATURE:'start.feature',
  START_RELEASE:'start.release',

  DEVELOP:'merge.to.develop',
  MERGE_RELEASE:'merge.release',
  MASTER: 'merge.master',

  FIX_BRANCH:'fix',
  VER:'update.version',
  VER_MAJOR: 'update.version.major',
  VER_MINOR: 'update.version.minor',
  FEATURE_BUILD:'update.build',
  BRANCH_UPDATE: 'merge.from.develop',
  ABANDON:'abandon'
})

export default taskConstants