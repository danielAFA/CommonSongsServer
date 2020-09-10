module.exports = {
  parserOptions: {
    ecmaVersion: 6
  },
  parser: 'babel-eslint',
  env: {
    node: true
  },
  extends: 'eslint:recommended',
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off'
  }
}
