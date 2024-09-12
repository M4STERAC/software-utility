import * as os from 'os';
import * as fs from 'fs';

export default async function create_godot_patch_release() {

  const filename = 'project.godot';
  const delimiter = os.platform() === 'win32' ? '/' : '\\';
  const filepath = process.cwd() + delimiter + filename;

  //Check if project.godot is in working directory - Return if not
  if (!fs.existsSync(filepath)) throw 'Required file project.godot does not exist in current working directly. Please try again in the current directoy';

  try {
    const project_godot = fs.readFileSync(filepath, 'utf8');
    console.log(project_godot);
  } catch (err) {
    console.error('Error reading file:', err);
  }
};