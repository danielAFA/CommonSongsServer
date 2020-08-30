module.exports = {
  parserOptions: {
    sourceType: 'module'
  },
  parser: 'babel-eslint',
  env: {
    node: true
  },
  extends: 'eslint:recommended',
  plugins: ['prettier'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': [
      'error',
      {
        semi: false
      }
    ]
  }
}
