import create_godot_release from '../../src/godot/create-godot-release';

import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import * as path from 'path';
import * as child_process from 'child_process';

jest.setTimeout(3000);
jest.mock('fs');
jest.mock('axios');
jest.mock('path');
jest.mock('child_process');

describe('Create Godot Release - Happy Paths w/ Mocks', () => {
  beforeEach(() => {
    jest.spyOn(path, 'basename').mockReturnValueOnce(jest.requireActual('path').basename(`C:\\Users\\mrman\\Development\\ProjectAres`, path.sep));
    jest.spyOn(path, 'resolve').mockReturnValue(`C:\\Users\\mrman\\Development\\ProjectAres`);
    jest.spyOn(axios, 'get').mockResolvedValue({ 
      data: [{ name: '1.5.5', commit: { sha: 'MOCK_COMMIT_SHA' } }], status: 200 
    });
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${path.sep}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce('config/version="1.5.5"');
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
    jest.spyOn(child_process, 'execSync').mockImplementation(() => {
      const message = 'MOCK: Successfully executed termin command';
      console.log(message);
      return message;
    });
  });
  
  afterEach(() => jest.resetModules());
  
  test('Integration - Patch', async () => {
    const response = await create_godot_release({ patch: true });
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe(void 0);
  });

  test('Integration - Minor', async () => {
    const response = await create_godot_release({ minor: true });
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe(void 0);
  });

  test('Integration - Major', async () => {
    const response = await create_godot_release({ major: true });
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe(void 0);
  });
});

describe('Create Godot Release - Failure Paths', () => {
  beforeEach(() => {
    jest.spyOn(path, 'basename').mockReturnValueOnce('GITHUB REPOSITORY NAME');
    jest.spyOn(path, 'resolve').mockReturnValue(`${__dirname}${path.sep}GITHUB REPOSITORY NAME`);
    jest.spyOn(axios, 'get').mockResolvedValue({ 
      data: [{ name: '1.5.5', commit: { sha: 'MOCK_COMMIT_SHA' } }], status: 200 
    });
  });
  
  afterEach(() => jest.resetModules());

  test('Too many options', async () => {
    expect((await create_godot_release({ minor: true, major: true })).body).toBe('[macu cgr]: Too many options supplied, please choose one of patch, minor, or major');
  });
  
  test('File does not exist - macu-secrets.json', async () => {
    expect((await create_godot_release({ minor: true })).body).toBe('[macu cgr]: Could not find macu-secrets.json in your home directory. Please create your personal access token and try again');
  });

  test('File does not exist - project.godot', async () => {
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${path.sep}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce(void 0);
    expect((await create_godot_release({ patch: true })).body).toBe('[macu cgr]: Required file project.godot does not exist in current working directly. Please try again in the current directoy');
  });
  
  test('Misaligned Versions', async () => {
    jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce(jest.requireActual('fs').readFileSync(`${os.homedir()}${path.sep}macu-secrets.json`, 'utf-8'))
      .mockReturnValueOnce('config/version="1.0.0"');
    expect((await create_godot_release({ major: true })).body).toBe('[macu cgr]: Github tag and Godot versions are misaligned. Please fix this misalignment and try again');
  });
});