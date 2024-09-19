import { extractGodotVersion, readProjectGodot, getLatestRepoTag, getSecrets } from '../../../src/godot/utils/functions';
import * as path from 'path';

jest.setTimeout(500);


test('Extract Godot Version', async () => {
  const filepath = process.cwd() + path.sep + 'project.godot';
  const versionRegex = /config\/version="?(\d+\.\d+\.\d+)"?/;
  const project_godot = await readProjectGodot(filepath);
  const godot_version = await extractGodotVersion(project_godot, versionRegex);
  
  expect(godot_version[1]).toBe('3.0.1');
});

test('Get Latest Repository Tag', async () => {
  const secrets = await getSecrets();
  const REPOSITORY = 'godot-test-repo';
  const tag = await getLatestRepoTag(secrets.username, REPOSITORY, secrets.personal_access_token);

  expect(tag).toBeDefined();
});