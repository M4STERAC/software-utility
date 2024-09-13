module.exports = {
  globals: {
      'ts-jest': { tsconfig: '.tests/tsconfig.json' }
  },
  moduleDirectories: [
    'node_modules'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
      "^src\/(.*)$": "<rootDir>/src/$1",
      "^.mocks\/(.*)$": "<rootDir>/.mocks/$1",
      "^.data\/(.*)$": "<rootDir>/.data/$1",
  },
  roots: [
    '<rootDir>/.tests'
  ],
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)(spec|test).ts"
  ],
  transform: {
      '^.+\\.ts$': 'ts-jest',
      '^.+\\.js$': 'babel-jest',
      '^.+\\.sql$': '<rootDir>/.mocks/raw_loader.js'
  },
  transformIgnorePatterns: [
      "node_modules/(!?@octokit|chalk)"
  ],
  preset: 'ts-jest',
//   setupFiles: ['<rootDir>/.tests/setEnvVars.ts'],
}