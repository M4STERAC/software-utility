import * as os from 'os';
import * as fs from 'fs';
import chalk from 'chalk';
import * as increment from 'semver/functions/inc';
import axios from 'axios';
import * as prompts from 'prompts';

const readProjectGodot = async (filepath: string): Promise<string> => {
  if (!fs.existsSync(filepath)) throw 'Required file project.godot does not exist in current working directly. Please try again in the current directoy';
  const project_godot = fs.readFileSync(filepath, 'utf8');
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

const writeGodotVersion = async (project_godot: string, filepath: string): Promise<void> => {
  try {
    fs.writeFileSync(filepath, project_godot, 'utf-8');
  } catch (__ignored_error__) {
    throw 'Failed to write new version to project.godot... Please manually increment the version';
  }
};

const getSecrets = async () => {
  const secretsBuffer = fs.readFileSync(`${os.homedir()}/macu-secrets.json`, 'utf-8');
  if (!secretsBuffer) throw 'Could not find macu-secrets.json in your home directory. Please create your personal access token and try again';
  const secrets = JSON.parse(secretsBuffer);
  if (!secrets || !secrets.github.personal_access_token) throw 'Failed to parse secrets and get github personal access token';
  if (!secrets.github.username || !secrets.github.email) throw 'Username and/or email is not saved in macu.secrets.json. Fill this out then try again';
  return secrets.github;
};

type CGPR_Params = { repository: string };
export default async (options: CGPR_Params) => {
  
  const GITHUB_REPOSITORY = 
    options.repository || 
    (await prompts({ name: 'repository', message: 'What is the repository in which you intend to create a tag? (Case and Space Sensitive)', type: 'text' })).repository.trim();
  
  const filename = 'project.godot';
  const delimiter = os.platform() === 'win32' ? '\\' : '/';
  const filepath = process.cwd() + delimiter + filename;
  const versionRegex = /version="v(\d+\.\d+\.\d+)"/;
  
  try {
    //Get github personal access token from secrets file
    console.log(chalk.cyan('[macu cgpr]: Getting secrets...'));
    const GITHUB_SECRESTS = await getSecrets();
    const GITHUB_USERNAME = GITHUB_SECRESTS.username;
    const GITHUB_EMAIL = GITHUB_SECRESTS.email; 
    const __GITHUB_PERSONAL_ACCESS_TOKEN__ = GITHUB_SECRESTS.personal_access_token;
    console.log(chalk.cyan('[macu cgpr]: Reading project.godot'));
    const project_godot = await readProjectGodot(filepath);
    const godot_version = await extractGodotVersion(project_godot, versionRegex);

    if (!godot_version) throw 'Unable to find current version in the project.godot file';
    console.log(chalk.green('[macu cgpr]: Successfully found version in project_godot'));

    //Get current file version
    const CURRENT_GODOT_VERSION = godot_version[1];

    //Get current github version
    const tags = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/tags`, {
      headers: {
        Authorization: `Bearer ${__GITHUB_PERSONAL_ACCESS_TOKEN__}`
      }
    });
    const CURRENT_REPO_VERSION = tags.data.length > 0 ? tags.data[0].name : 'v0.0.0';

    //If file version !== current github tag, throw error
    if (`v${CURRENT_GODOT_VERSION}` !== CURRENT_REPO_VERSION) throw 'Github tag and Godot versions are misaligned. Please fix this misalignment and try again';
    console.log(chalk.green(`[macu cgpr]: Successfully validated Godot\'s version is the same as the latest tag for the ${GITHUB_REPOSITORY} repository`));

    //Create new version
    const NEW_VERSION = increment(CURRENT_GODOT_VERSION, 'patch');
    console.log('new version: ', NEW_VERSION);

    //Create github tag for new version
    const tagData = {
      tag: NEW_VERSION,
      message: '',
      object: 'commit',
      tagger: {
        name: GITHUB_USERNAME,
        email: GITHUB_EMAIL,
        date: new Date()
      }
    };
    const response = await axios.post(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/tags`, tagData, {
      headers: {
        Authorization: `Bearer ${__GITHUB_PERSONAL_ACCESS_TOKEN__}`
      }
    });

    console.log(response);

    //Write new version to project.godot
    await writeGodotVersion(project_godot, filepath);
    console.log(chalk.green('[macucgpr]: Successfully wrote new version to project.godot'));

    //Commit and push changes to project.godot
  } catch (err) {
    console.error(chalk.red(`[macu cgpr]: ${err}`));
  }
};