// Jest doesn't natively understand our TypeScript path aliases, so we map them
// manually here to keep tests working without needing to parse tsconfig.json.

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^next/link$': '<rootDir>/test-utils/NextLink.tsx',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1',
    '^@styles/(.*)$': '<rootDir>/styles/$1',
    '^@contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/constants/(.*)$': '<rootDir>/constants/$1',
    '^@/types$': '<rootDir>/types/index.ts',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  },
};
