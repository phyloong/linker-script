// Build script: bundles the extension entry point and the test files.
// Type checking is handled separately by `tsc --noEmit`.
const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node16',
    external: ['vscode'],
    // The packaged bundle must not reference a map that `.vscodeignore` leaves
    // out of the VSIX. Test bundles keep their maps for local stack traces;
    // they are never packaged.
    sourcemap: false,
    minify: production,
    logLevel: 'info'
};

/** @type {import('esbuild').BuildOptions} */
const testConfig = {
    // Glob entry points so new test files are picked up without editing this file.
    entryPoints: ['src/test/**/*.test.ts'],
    outbase: 'src',
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node16',
    external: ['vscode'],
    sourcemap: !production,
    minify: false,
    logLevel: 'info'
};

async function main() {
    if (watch) {
        const contexts = await Promise.all(
            [extensionConfig, testConfig].map((config) => esbuild.context(config))
        );
        await Promise.all(contexts.map((context) => context.watch()));
        console.log('[watch] build finished, watching for changes...');
        return;
    }
    await Promise.all([extensionConfig, testConfig].map((config) => esbuild.build(config)));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
