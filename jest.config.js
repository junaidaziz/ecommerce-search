export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^next/link$': '<rootDir>/test-utils/NextLink.tsx'
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  }
};
