/**
 * @type {import("@types/eslint").Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    'plugin:hydrogen/recommended',
    'plugin:hydrogen/typescript',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/naming-convention': 'off',
    // TODO: Remove jest plugin from hydrogen/eslint-plugin
    'jest/no-deprecated-functions': 'off',
    'hydrogen/prefer-image-component': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    'no-case-declarations': 'off',
    'prefer-const': 'off',
  },
};
