import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

const eslintConfig = [
    {
        ignores: ['dist', 'node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/app/(payload)/**'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2020,
            },
        },
        plugins: {
            '@typescript-eslint': ts,
            import: eslintPluginImport,
            'simple-import-sort': simpleImportSort,
            '@next/next': nextPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...ts.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        // 1. React в самом верху
                        ['^react$', '^react-dom$', '^react/'],
                        // 2. Сторонние пакеты: @mui, next, clsx, lodash и т.д.
                        ['^@?\\w'],
                        // 3. Абсолютные импорты через @/ (например, '@/components')
                        ['^@/'],
                        // 4. Относительные импорты из родительских папок: '../'
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                        // 5. Относительные импорты из текущей папки: './'
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                        // 6. Стили (CSS/SCSS модули)
                        ['^.+\\.module\\.(css|scss|sass)$'],
                        // 7. Медиафайлы
                        ['^.+\\.(gif|png|svg|jpg|jpeg|webp)$'],
                        // 8. Импорты с side effects (например, CSS без модулей)
                        ['^\\u0000'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    prettier,
];

export default eslintConfig;
