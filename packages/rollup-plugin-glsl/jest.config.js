export default {
  preset: 'ts-jest',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['<rootDir>/test/**/*.ts'],
  testPathIgnorePatterns: ['.+.d.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text'],
  transform: {
    '\\.[jt]s$': ['ts-jest'],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@plutotcool/glsl-bundler/src|import-meta-resolve)/)'
  ],
  moduleNameMapper: {
    '@plutotcool/glsl-bundler': '<rootDir>/node_modules/@plutotcool/glsl-bundler/src/index.ts'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        rootDir: '../'
      }
    }
  }
}
