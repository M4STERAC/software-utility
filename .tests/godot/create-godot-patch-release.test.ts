import create_godot_patch_release from '../../src/godot/create-godot-patch-release';

describe('Happy Paths', () => {
  test('Unit Test', () => {
    const response = create_godot_patch_release({ repository: 'EasyGSMOld', branch: 'v1.x.x' });
    expect(response).toBeDefined();
  });
});