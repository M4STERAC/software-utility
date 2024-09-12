import generateTextArt from '../../src/utils/console-art';
import { M, A, C, U } from '../../src/utils/letters';

describe('Console Art - Happy Paths', () => {
  test('Unit Test', () => {
    const response = generateTextArt('MACU');
    console.log(response);
    expect(response).toBeDefined();
  });
});