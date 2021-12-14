export default {
  preset: 'ts-jest',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['<rootDir>/test/**/*.ts'],
  testPathIgnorePatterns: ['.+.d.ts', '.+.environment.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text'],
  transform: {
    '\\.[jt]s$': ['ts-jest'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!import-meta-resolve/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        rootDir: './'
      }
    }
  }
}
