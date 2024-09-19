import * as increment from 'semver/functions/inc';
// import * as prompts from 'prompts';
import * as chalk from 'chalk';
import * as path from 'path';
import { 
  readProjectGodot, 
  createGithubTag, 
  extractGodotVersion, 
  getLatestRepoTag, 
  getSecrets, 
  injectGodotVersion, 
  pushGithubChanges, 
  writeProjectGodot 
} from './utils/functions';

type CGPR_RESPONSE = { statusCode: number, body: string | undefined };
export default async (): Promise<CGPR_RESPONSE> => {

  const filename = 'project.godot';
  const filepath = process.cwd() + path.sep + filename;
  const versionRegex = /config\/version="?(\d+\.\d+\.\d+)"?/;
    
  try {
    //Get github personal access token from secrets file
    console.log(chalk.cyan('[macu cgpr]: Getting secrets...'));
    const GITHUB_SECRESTS = await getSecrets();
    const GITHUB_USERNAME = GITHUB_SECRESTS.username;
    const __GITHUB_PERSONAL_ACCESS_TOKEN__ = GITHUB_SECRESTS.personal_access_token;

    const GITHUB_REPOSITORY_PATH = path.resolve(process.cwd());
    const GITHUB_REPOSITORY = path.basename(GITHUB_REPOSITORY_PATH, path.sep);
    console.log(chalk.cyan('[macu cgpr]: Repo Path -', GITHUB_REPOSITORY_PATH));
    console.log(chalk.cyan('[macu cgpr]: Repo -', GITHUB_REPOSITORY));
    
    console.log(chalk.cyan('[macu cgpr]: Reading project.godot'));
    const project_godot = await readProjectGodot(filepath);
    const godot_version = await extractGodotVersion(project_godot, versionRegex);

    if (!godot_version) throw 'Unable to find current version in the project.godot file, please ensure this line is in the project.godot file under [application]: config/version="1.2.3"';
    console.log(chalk.cyan('[macu cgpr]: Successfully found version in project_godot'));

    //Get current file version
    const CURRENT_GODOT_VERSION = godot_version[1];

    //Get current github version
    const { commit, tag } = await getLatestRepoTag(GITHUB_USERNAME, GITHUB_REPOSITORY, __GITHUB_PERSONAL_ACCESS_TOKEN__);
    const CURRENT_REPO_VERSION: string = tag;
    const LATEST_REPO_COMMIT_HASH: string = commit;
    console.log(chalk.cyan('[macu cgpr]: Latest Commit -', LATEST_REPO_COMMIT_HASH));

    //If file version !== current github tag, throw error
    if (`${CURRENT_GODOT_VERSION}` !== CURRENT_REPO_VERSION) throw 'Github tag and Godot versions are misaligned. Please fix this misalignment and try again';
    console.log(chalk.cyan(`[macu cgpr]: Successfully validated Godot\'s version is the same as the latest tag for the ${GITHUB_REPOSITORY} repository`));

    //Create new version
    const NEW_VERSION = increment(CURRENT_GODOT_VERSION, 'major');
    console.log(chalk.cyan('[macu cgpr]: New Version -', NEW_VERSION));

    //Write new version to project.godot
    const updated_project_godot = await injectGodotVersion(project_godot, versionRegex, NEW_VERSION);
    await writeProjectGodot(updated_project_godot, filepath);
    console.log(chalk.cyan('[macu cgpr]: Successfully wrote new version to project.godot'));
    
    //Commit and push changes to project.godot
    await pushGithubChanges('Injected new version into project.godot', ['project.godot']);

    await createGithubTag(NEW_VERSION, GITHUB_USERNAME);
    console.log(chalk.bgGreen(`[macu cgpr]:`) + ' ' + chalk.green(`Successfully created tag object for latest commit and pushed to ${GITHUB_REPOSITORY}`));

    return {
      statusCode: 204,
      body: void 0,
    }

  } catch (err) {
    console.error(chalk.bgRed(`[macu cgpr]:`) + ' ' + chalk.red(`${err}`));
    return {
      statusCode: 500,
      body: `[macu cgpr]: ${err}`,
    };
  }
};