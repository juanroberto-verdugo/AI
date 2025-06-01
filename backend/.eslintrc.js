module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Asegura que Prettier se ejecute como una regla de ESLint
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020, // Permite el parsing de características modernas de ECMAScript
    sourceType: 'module', // Permite el uso de imports
  },
  env: {
    node: true, // Habilita variables globales de Node.js y el scope de Node.js.
    es6: true, // Habilita todas las características de ECMAScript 6 excepto los módulos.
  },
  rules: {
    'prettier/prettier': 'warn', // Muestra las diferencias de Prettier como warnings
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Permite el uso de console.log, útil para el backend
    // Puedes añadir más reglas personalizadas aquí
  },
  ignorePatterns: ['node_modules/', 'dist/', '.env', '*.log', 'coverage/', '.DS_Store'],
};
