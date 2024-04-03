/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'],
  coverageReporters: ['html'],
  coverageDirectory: './docs/coverage',
}
