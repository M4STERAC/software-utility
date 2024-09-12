import generateTextArt from '../../src/utils/console-art';

describe('Console Art - Happy Paths', () => {
  test('Unit Test', () => {
    const response = generateTextArt('MACU');
    console.log(response);
    expect(response).toBeDefined();
  });
});