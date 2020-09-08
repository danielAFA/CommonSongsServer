module.exports = {
  parserOptions: {
    ecmaVersion: 6
  },
  parser: 'babel-eslint',
  env: {
    node: true
  },
  extends: 'eslint:recommended',
  plugins: ['prettier'],
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'prettier/prettier': [
      'error',
      {
        semi: false
      }
    ]
  }
}
