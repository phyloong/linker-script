import { defineConfig } from '@vscode/test-cli';

// Tests that need a real extension host. Pure-Node unit tests also run through
// `npm run test:unit` without downloading VS Code.
export default defineConfig({
    files: 'dist/**/*.test.js',
    version: '1.74.0',
    mocha: {
        ui: 'tdd',
        timeout: 20000
    }
});
