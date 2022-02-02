import fs from'fs';
import homedirTool from 'os'
import ld from 'lodash';
import gitUrlParse from 'git-url-parse';
import semver from 'semver';
import osName from 'os-name';
import t from '../toolbox'
import chalk from 'chalk'


export class Util {

  constructor() {
  }

  getSystemInfo(){
    return {
      'cc-flow': '?.?.?',
      node: process.version,
      os: osName()
    }
  }

  clean(args){
    return args.filter(arg => arg != null);
  }

  format(template = '', context = {}) {
    const log = t.log
    try {
      return ld.template(template)(context);
    } catch (error) {
      log.error(`Unable to render template with context:\n${template}\n${JSON.stringify(context)}`);
      log.error(error);
      throw error;
    }
  };

  parseGitUrl(remoteUrl){
    if (!remoteUrl) return { host: null, owner: null, project: null, protocol: null, remote: null, repository: null };
    const normalizedUrl = remoteUrl.replace(/\\/g, '/');
    const parsedUrl = gitUrlParse(normalizedUrl);
    const { resource: host, name: project, protocol, href: remote } = parsedUrl;
    const owner = protocol === 'file' ? ld.last(parsedUrl.owner.split('/')) : parsedUrl.owner;
    const repository = `${owner}/${project}`;
    return { host, owner, project, protocol, remote, repository };
  }

  hasAccess(path){
    try {
      fs.accessSync(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  // JJHNOTE POMFIX
  getImmediateVersion(){
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    return this.parseVersion(pjJson.version)
  }

  getImmediateTargetBranch(){
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    return pjJson.targetBranch||null
  }

  setAllVersionData(version:string,branchTarget?:string){
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    pjJson.version = version
    if(branchTarget){
      pjJson.targetBranch = branchTarget
    }
    else{
      delete pjJson.targetBranch
    }
    fs.writeFileSync('./package.json',JSON.stringify(pjJson,null,2))

    const plText = ''+fs.readFileSync('./package-lock.json')
    const plJson = JSON.parse(plText)
    plJson.version = version
    fs.writeFileSync('./package-lock.json',JSON.stringify(plJson,null,2))
  }

  setTargetBranch(targetBranch:string)
  {
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    pjJson.targetBranch=targetBranch
    fs.writeFileSync('./package.json', JSON.stringify(pjJson, null, 2))
  }

  getTargetBranch():string
  {
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    return pjJson.targetBranch
  }

  removeTargetBranch(){
    const pjText = ''+fs.readFileSync('./package.json')
    const pjJson = JSON.parse(pjText)
    delete pjJson.targetBranch
    fs.writeFileSync('./package.json',JSON.stringify(pjJson,null,2))
  }

  async bump(version:string) {
    // use the supplied tag, or try to get the tag from resolveTag
    // const tag = t.state.tag || (await this.resolveTag(version));
    // t.setState({ version, tag });  // hold on to the version and the tag

    // work to do in a spinner
    const task = () =>
      t.shell.exec(`npm version ${version} --no-git-tag-version`).catch(err => {
        // Syntax warning for old Java coders:
        // next line should be read as
        //  err.toLowerCase().indexOf("version not changed") != -1
        if (/version not changed/i.test(err)) {
          t.log.warn(`Did not update version in package.json, etc. (already at ${version}).`);
        } else {
          return false;
        }
      });
    return t.spinner.show({ task, label: 'npm version' }); // do the task
  }

  parseVersion(raw:string){
    if (!raw) return { version: null, isPreRelease: false, preReleaseId: null };
    const version:string = semver.valid(raw) ? raw : semver.coerce(raw);
    const parsed = semver.parse(version);
    if(!parsed){
      t.log.error('unable to parse '+version)
      return {}
    }
    const isPreRelease = parsed.prerelease.length > 0;
    const preReleaseId = isPreRelease && isNaN(parsed.prerelease[0]) ? parsed.prerelease[0] : null;
    return {
      version,
      isPreRelease,
      preReleaseId
    };
  };


  removeVersionPreReleasePart(curVer:string) {
    if (curVer.indexOf('-') !== -1) {
        return curVer.substring(0, curVer.indexOf('-'));
    }
    return curVer;
  }

  getChangeLog():string
  {
    let clText = ''
    try {
      clText = ''+fs.readFileSync('./CHANGELOG.md')
    }
    catch (err) {
      t.log.info('no existing CHANGELOG.MD found')
      clText=''
    }
    return clText
  }

  setChangeLog(targetCL:string, branchCL?:string)
  {
    try {
      if(branchCL){
        fs.writeFileSync('./CHANGELOG.md',branchCL+'\n\n'+targetCL)
      }
      else{
        fs.writeFileSync('./CHANGELOG.md',targetCL)
      }
    }
    catch (err) {
      t.log.error('unable to write CHANGELOG.md')
    }
  }

  async branchWarning(){
    const curVer = t.util.getImmediateVersion()
    const curBranch = await t.git.getCurBranchName()
    t.log.info(`You are about to delete ${chalk.blue(curBranch)} at version ${chalk.blue(curVer.version)}`)
    if(curVer.isPreRelease){
      t.log.info(`${chalk.red('WARNING')} this is a completed released version.   Please do not delete it unless it is at least a year old.`)
    }
  }

  addChangeLogLine(msg:string)
  {
    // copy the changelog and the version number
    let clText = ''
    try {
      clText = fs.readFileSync('./CHANGELOG.md').toString()
    }
    catch (err) {
      t.log.info('no existing CHANGELOG.MD found.  Creating a new one.')
    }

    const dateString = (new Date()).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
    clText = '- '+dateString+'  '+msg+'\n'+clText
    fs.writeFileSync('./CHANGELOG.md',clText)
  }

  getInitials(){
    try {
      const homedir = homedirTool.homedir()
      let initials = '' + fs.readFileSync(homedir+'/git.initials.txt')
      initials = initials.trim()
      initials = initials.replace(/\s/g, ' ').toUpperCase()

      t.log.info(`found initials ${initials} in ~/git.initials.txt`);
      initials += '/'
      return initials
    }
    catch (err) {
      t.log.info(`The UX team prefers to prefix branch names with developer initials.  If you want this, put your initials into the file ~/git.initials.txt`);
    }
    return ''
  }




}

export default Util