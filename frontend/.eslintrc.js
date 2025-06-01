module.exports = {
  root: true, // Importante para que ESLint no busque configuraciones en directorios padre
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Asegura que Prettier se ejecute como una regla de ESLint
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Permite el parsing de JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Detecta automáticamente la versión de React a usar
    },
  },
  env: {
    browser: true, // Habilita variables globales de navegador y el scope de navegador.
    node: true, // Habilita también Node.js para archivos de configuración, etc.
    es6: true,
  },
  rules: {
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }], // Muestra las diferencias de Prettier como warnings
    'react/react-in-jsx-scope': 'off', // No es necesario con React 17+ y el nuevo JSX transform
    'react/prop-types': 'off', // Deshabilitado ya que usamos TypeScript para tipos
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Permite no tener que declarar tipos de retorno explícitos
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn', // Advierte sobre console.log en el frontend
  },
  ignorePatterns: ['node_modules/', 'dist/', '.vite/', 'vite.config.ts.timestamp-*', '*.log', 'coverage/', '.DS_Store'],
};
