// ESLint flat config replacing the removed tslint.json.
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist/**', 'out/**', 'node_modules/**', '.vscode-test/**']
    },
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            // Provider signature parameters are mandated by the VS Code API.
            '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }]
        }
    }
);
