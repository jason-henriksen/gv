
import t from '../util/toolbox'
import semver from 'semver'

class Task
{

  init() {}
  getName():string { return ''}
  getLatestVersion():string { return ''}
  getChangelog():string { return ''}
  getIncrementedVersionCI(values:any={}):string { return ''}
  getIncrementedVersion(values:any={}):string { return ''}
  beforeBump(values:any={}):string { return ''}
  bump(values:any={}):any { return {}}
  beforeRelease(values:any={}):string { return ''}
  async release(values:any={}):Promise<any> { return Promise.resolve({})}
  afterRelease():void { }

  async runTasks(){

    await this.init();

    const name = (await this.getName()) || '__test__';
    const latestVersion = (await this.getLatestVersion()) || '1.0.0';
    const changelogText = (await this.getChangelog()) || null;
    const increment = t.state.incrementNeeded
    t.setState({ name, latestVersion, latestTag: latestVersion, changelogText });

    const version =
      this.getIncrementedVersionCI({ latestVersion, increment }) ||
      (await this.getIncrementedVersion({ latestVersion, increment })) ||
      increment
        ? semver.inc(latestVersion, increment || 'patch')
        : latestVersion;
    t.setState(t.util.parseVersion(version));

    await this.beforeBump();
    await this.bump(version);

    t.setState({ tagName: version });

    await this.beforeRelease();
    await this.release();
    await this.afterRelease();

    return {
      name,
      latestVersion,
      version
    };

  }

}

export default Task