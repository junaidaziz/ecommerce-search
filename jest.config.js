export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^next/link$': '<rootDir>/test-utils/NextLink.js'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
