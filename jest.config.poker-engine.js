const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-poker-engine.ts'],
  testEnvironment: 'node',
  testMatch: ['**/poker-engine/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/backend/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/models/(.*)$': '<rootDir>/src/models/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/poker-engine/(.*)$': '<rootDir>/src/poker-engine/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mongodb-memory-server|mongodb|bson|@mongodb-js)/)',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};

module.exports = createJestConfig(customJestConfig);