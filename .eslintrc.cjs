/**
 * @type {import("@types/eslint").Linter.BaseConfig}
 */
module.exports = {
  extends: ["@remix-run/eslint-config"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/naming-convention": "off",
    "hydrogen/prefer-image-component": "off",
    "no-useless-escape": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "no-case-declarations": "off",
    // TODO: Remove jest plugin from hydrogen/eslint-plugin
    "jest/no-deprecated-functions": "off",
    "react/display-name": "off",
    "prefer-const": "off",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/label-has-associated-control": "warn",
  },
};
