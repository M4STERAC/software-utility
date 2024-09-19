import { extractGodotVersion, readProjectGodot } from '../../../src/godot/utils/functions';
import * as path from 'path';

jest.setTimeout(500);

test('Extract Godot Version', async () => {
  const filepath = process.cwd() + path.sep + 'project.godot';
  const versionRegex = /config\/version="?(\d+\.\d+\.\d+)"?/;
  const project_godot = await readProjectGodot(filepath);
  const godot_version = await extractGodotVersion(project_godot, versionRegex);

  expect(godot_version[1]).toBe('3.0.1');
});