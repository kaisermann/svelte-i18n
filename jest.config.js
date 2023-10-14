/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  // [...]
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  transform: {
    '\\.ts$': ['ts-jest', { useESM: true }],
  },
};
