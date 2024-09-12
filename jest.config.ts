export default {
  globals: {
      'ts-jest': { tsconfig: '.tests/tsconfig.json' }
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
      "^src\/(.*)$": "<rootDir>/src/$1",
      "^.tests\/(.*)$": "<rootDir>/.tests/$1",
      "^.mocks\/(.*)$": "<rootDir>/.mocks/$1",
      "^.data\/(.*)$": "<rootDir>/.data/$1",
  },
  testMatch: [
      '<rootDir>/.tests/**/*.test.ts'
  ],
  transform: {
      '^.+\\.ts$': 'ts-jest',
      '^.+\\.js$': 'babel-jest',
      '^.+\\.sql$': '<rootDir>/.mocks/raw_loader.js'
  },
  transformIgnorePatterns: [
      "/node_modules/"
  ],
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/.tests/setEnvVars.ts'],
}