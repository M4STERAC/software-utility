import create_godot_patch_release from '../../src/godot/create-godot-patch-release';

import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import * as path from 'path';
import * as child_process from 'child_process';

jest.setTimeout(3000);
jest.mock('fs')
jest.mock('axios')
jest.mock('path')
jest.mock('child_process')

describe('Create Godot Patch Release - Happy Paths w/ Mocks', () => {
  beforeEach(() => {
    jest.spyOn(path, 'basename').mockReturnValueOnce('GITHUB REPOSITORY NAME');
    jest.spyOn(axios, 'get').mockResolvedValue({ 
      data: [{ name: 'v1.5.5', commit: { sha: 'MOCK_COMMIT_SHA' } }] 
    });
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${os.platform() === 'win32' ? '\\' : '/'}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce('config/version="v1.5.5"');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
    jest.spyOn(child_process, 'execSync').mockImplementation(() => {
      const message = 'MOCK: Successfully executed termin command';
      console.log(message);
      return message;
    });
  });
  
  afterEach(() => jest.resetModules());
  
  test('Integration Test', async () => {
    const response = await create_godot_patch_release();
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe(void 0);
  });
});

describe('Create Godot Patch Release - Failure Paths', () => {
  beforeEach(() => {
    jest.spyOn(path, 'basename').mockReturnValueOnce('GITHUB REPOSITORY NAME');
    jest.spyOn(axios, 'get').mockResolvedValue({ 
      data: [{ name: 'v1.5.5', commit: { sha: 'MOCK_COMMIT_SHA' } }] 
    });
  });
  
  afterEach(() => jest.resetModules());
  
  test('File does not exist - macu-secrets.json', async () => {
    expect((await create_godot_patch_release()).body).toBe('[macu cgpr]: Could not find macu-secrets.json in your home directory. Please create your personal access token and try again');
  });

  test('File does not exist - project.godot', async () => {
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${os.platform() === 'win32' ? '\\' : '/'}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce(void 0);
    expect((await create_godot_patch_release()).body).toBe('[macu cgpr]: Required file project.godot does not exist in current working directly. Please try again in the current directoy');
  });
  
  test('Misaligned Versions', async () => {
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${os.platform() === 'win32' ? '\\' : '/'}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce('config/version="v1.0.0"');
    expect((await create_godot_patch_release()).body).toBe('[macu cgpr]: Github tag and Godot versions are misaligned. Please fix this misalignment and try again');
  });
});