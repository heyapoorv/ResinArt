/**
 * jest.config.js
 */
module.exports = {
  testEnvironment : 'node',
  testMatch       : ['**/tests/**/*.test.js'],
  setupFilesAfterFramework: [],
  testTimeout     : 30000,
  forceExit       : true,
  clearMocks      : true,
};
