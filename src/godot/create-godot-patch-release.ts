import * as os from 'os';
import * as fs from 'fs';
import * as increment from 'semver/functions/inc';
import axios, { AxiosResponse } from 'axios';
// import * as prompts from 'prompts';
import * as path from 'path';
import * as child_process from 'child_process';

const readProjectGodot = async (filepath: string): Promise<string> => {
  const project_godot = fs.readFileSync(filepath, 'utf8');
  if (!project_godot) throw 'Required file project.godot does not exist in current working directly. Please try again in the current directoy';
  return project_godot;
};

/**
 * Checks to make sure the config/version="vx.x.x" is in project.godot
 * @param project_godot string
 * @returns boolean
 */
const extractGodotVersion = async (project_godot: string, regex: RegExp): Promise<boolean | any[]> => {
  const match = project_godot.match(regex);
  if (!match) return false;
  return match;
};

const injectGodotVersion = async (project_godot: string, regex: RegExp, version: string): Promise<string> => {
  try {
    const updated_project_godot = project_godot.replace(project_godot.match(regex)[1], version);
    return updated_project_godot;
  } catch (err) {
    throw 'Failed to inject new version to project.godot... PLease manually increment the version';
  }
};

const writeProjectGodot = async (project_godot: string, filepath: string): Promise<void> => {
  try {
    fs.writeFileSync(filepath, project_godot, 'utf-8');
  } catch (__ignored_error__) {
    throw 'Failed to write new version to project.godot... Please manually increment the version';
  }
};

const pushGithubChanges = async (message: string, files: string[]) => {
  const filesToStage: string = files.join(' ');
  child_process.execSync(`git add ${filesToStage}`);
  child_process.execSync(`git commit -m "[macu cgpr]: ${message}"`);
  child_process.execSync(`git push`);
};

const getSecrets = async () => {
  const secretsBuffer = fs.readFileSync(`${os.homedir()}${path.sep}macu-secrets.json`, 'utf-8');
  if (!secretsBuffer) throw 'Could not find macu-secrets.json in your home directory. Please create your personal access token and try again';
  const secrets = JSON.parse(secretsBuffer);
  if (!secrets || !secrets.github.personal_access_token) throw 'Failed to parse secrets and get github personal access token';
  if (!secrets.github.username || !secrets.github.email) throw 'Username and/or email is not saved in macu.secrets.json. Fill this out then try again';
  return secrets.github;
};

const getLatestRepoTag = async (GITHUB_USERNAME: string, GITHUB_REPOSITORY: string, GITHUB_TOKEN: string): Promise<AxiosResponse> => {
  const tags = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/tags`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`
    }
  });
  if (tags.data.length === 0 || !tags.data[0].commit.sha) 
    throw 'There has not been an initial tag created. Please manually create the first tag for the repository and you can make the subsequential tags with this CLI tool';
  return tags;
};

const createGithubTag = async (tag: string, GITHUB_USERNAME: string): Promise<void> => {
  try {
    const message: string = `[macu cgpr]: Patch Release by ${GITHUB_USERNAME}`;
    child_process.execSync(`git tag -a v${tag} -m "${message}"`);
    child_process.execSync(`git push origin v${tag}`);
  } catch (err) {
    throw `Failed to commit and/or push new tag: ${err}`;
  }
};

type CGPR_RESPONSE = { statusCode: number, body: string | undefined };
export default async (): Promise<CGPR_RESPONSE> => {
  
  const filename = 'project.godot';
  const filepath = process.cwd() + path.sep + filename;
  const versionRegex = /version="v(\d+\.\d+\.\d+)"/;
    
  try {
    //Get github personal access token from secrets file
    console.log('[macu cgpr]: Getting secrets...');
    const GITHUB_SECRESTS = await getSecrets();
    const GITHUB_USERNAME = GITHUB_SECRESTS.username;
    const __GITHUB_PERSONAL_ACCESS_TOKEN__ = GITHUB_SECRESTS.personal_access_token;
    const GITHUB_REPOSITORY_PATH = path.resolve(__dirname, '..', '..');
    const GITHUB_REPOSITORY = path.basename(GITHUB_REPOSITORY_PATH, path.sep);
    console.log('Repo: ', GITHUB_REPOSITORY);
    
    console.log('[macu cgpr]: Reading project.godot');
    const project_godot = await readProjectGodot(filepath);
    const godot_version = await extractGodotVersion(project_godot, versionRegex);

    if (!godot_version) throw 'Unable to find current version in the project.godot file';
    console.log('[macu cgpr]: Successfully found version in project_godot');

    //Get current file version
    const CURRENT_GODOT_VERSION = godot_version[1];

    //Get current github version
    const tags = await getLatestRepoTag(GITHUB_USERNAME, GITHUB_REPOSITORY, __GITHUB_PERSONAL_ACCESS_TOKEN__);
    const CURRENT_REPO_VERSION = tags.data[0].name;
    const LATEST_REPO_COMMIT_HASH = tags.data[0].commit.sha;
    console.log('[macu cgpr]: Latest Commit: ', LATEST_REPO_COMMIT_HASH);

    //If file version !== current github tag, throw error
    if (`v${CURRENT_GODOT_VERSION}` !== CURRENT_REPO_VERSION) throw 'Github tag and Godot versions are misaligned. Please fix this misalignment and try again';
    console.log(`[macu cgpr]: Successfully validated Godot\'s version is the same as the latest tag for the ${GITHUB_REPOSITORY} repository`);

    //Create new version
    const NEW_VERSION = increment(CURRENT_GODOT_VERSION, 'patch');
    console.log('[macu cgpr]: New Version: ', NEW_VERSION);

    //Write new version to project.godot
    const updated_project_godot = await injectGodotVersion(project_godot, versionRegex, NEW_VERSION);
    await writeProjectGodot(updated_project_godot, filepath);
    console.log('[macu cgpr]: Successfully wrote new version to project.godot');
    
    //Commit and push changes to project.godot
    await pushGithubChanges('Injected new version into project.godot', ['project.godot']);

    await createGithubTag(NEW_VERSION, GITHUB_USERNAME);
    console.log(`[macu cgpr]: Successfully created tag object for latest commit and pushed to ${GITHUB_REPOSITORY}`);

    return {
      statusCode: 204,
      body: void 0,
    }

  } catch (err) {
    console.error(`[macu cgpr]: ${err}`);
    return {
      statusCode: 500,
      body: `[macu cgpr]: ${err}`,
    };
  }
};