module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^next/link$': '<rootDir>/test-utils/NextLink.tsx',
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  },
};
