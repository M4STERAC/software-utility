import * as fs from 'fs';
import * as child_process from 'child_process';
import axios, { AxiosResponse } from 'axios';
import * as path from 'path';
import * as os from 'os';

/**
 * Gets and returns the content of project.godot
 * @param filepath string: Filepath to project.godot
 * @returns string
 */
export const readProjectGodot = async (filepath: string): Promise<string> => {
  const project_godot = fs.readFileSync(filepath, 'utf8');
  if (!project_godot) throw 'Required file project.godot does not exist in current working directly. Please try again in the current directoy';
  return project_godot;
};

/**
 * Checks to make sure the config/version="vx.x.x" is in project.godot
 * @param project_godot string
 * @returns boolean
 */
export const extractGodotVersion = async (project_godot: string, regex: RegExp): Promise<boolean | any[]> => {
  const match = project_godot.match(regex);
  if (!match) return false;
  return match;
};

/**
 * Injects a version tag into project.godot
 * @param project_godot string: Content of project.godot
 * @param regex RegExp: Used to look for version to remove and inject
 * @param version string: Version to inject
 * @returns string
 */
export const injectGodotVersion = async (project_godot: string, regex: RegExp, version: string): Promise<string> => {
  try {
    const updated_project_godot = project_godot.replace(project_godot.match(regex)[1], version);
    return updated_project_godot;
  } catch (err) {
    throw 'Failed to inject new version to project.godot... PLease manually increment the version';
  }
};

/**
 * Writes project.godot content to a project.godot file. If no project.godot available at given filepath, it will create a new one
 * @param project_godot string: Content of project.godot
 * @param filepath string: Filepath to project.godot
 */
export const writeProjectGodot = async (project_godot: string, filepath: string): Promise<void> => {
  try {
    fs.writeFileSync(filepath, project_godot, 'utf-8');
  } catch (__ignored_error__) {
    throw 'Failed to write new version to project.godot... Please manually increment the version';
  }
};

/**
 * Stages, commits, and pushes a files to a remote repository
 * @param message string: Message to include for commit
 * @param files string[]: Names of files to stage for commit
 */
export const pushGithubChanges = async (message: string, files: string[]): Promise<void> => {
  const filesToStage: string = files.join(' ');
  child_process.execSync(`git add ${filesToStage}`);
  child_process.execSync(`git commit -m "[macu cgpr]: ${message}"`);
  child_process.execSync(`git push`);
};

/**
 * Reads the macu-secrets.json file in home directory to get Github information
 * @returns JSON
 */
export const getSecrets = async (): Promise<GithubSecrets> => {
  const secretsBuffer = fs.readFileSync(`${os.homedir()}${path.sep}macu-secrets.json`, 'utf-8');
  if (!secretsBuffer) throw 'Could not find macu-secrets.json in your home directory. Please create your personal access token and try again';
  const secrets = JSON.parse(secretsBuffer);
  if (!secrets || !secrets.github.personal_access_token) throw 'Failed to parse secrets and get github personal access token';
  if (!secrets.github.username || !secrets.github.email) throw 'Username and/or email is not saved in macu.secrets.json. Fill this out then try again';
  return secrets.github;
};
type GithubSecrets = { username: string; personal_access_token: string; email: string };

/**
 * Gets the latest tag and related commit sha for the given github repository
 * @param GITHUB_USERNAME string: Value from macu-secrets.json
 * @param GITHUB_REPOSITORY string: Value from macu-secrets.json
 * @param GITHUB_TOKEN string: Value from macu-secrets.json
 * @returns Object: Latest tag and related commit sha for given repository
 */
export const getLatestRepoTag = async (GITHUB_USERNAME: string, GITHUB_REPOSITORY: string, GITHUB_TOKEN: string): Promise<{ commit: string | undefined, tag: string }> => {
  const tags = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/tags`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`
    }
  });

  if (tags.status !== 200) throw 'API call to get latest repo tag failed. Please try again';
  if (tags.data.length === 0 || !tags.data[0].commit.sha) return { commit: void 0, tag: '0.0.0' };
  return { commit: tags.data[0].commit.sha, tag: tags.data[0].name };
};

/**
 * Creates a new Github tag for current repository
 * @param tag string: Tag to create
 * @param GITHUB_USERNAME string: Value from macu-secrets.json
 */
export const createGithubTag = async (tag: string, GITHUB_USERNAME: string): Promise<void> => {
  try {
    const message: string = `[macu cgpr]: Release by ${GITHUB_USERNAME}`;
    child_process.execSync(`git tag -a ${tag} -m "${message}"`);
    child_process.execSync(`git push origin ${tag}`);
  } catch (err) {
    throw `Failed to commit and/or push new tag: ${err}`;
  }
};