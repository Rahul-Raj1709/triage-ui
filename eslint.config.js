// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Downgrade react-refresh warning (since shadcn button.tsx mixes exports)
      "react-refresh/only-export-components": "off",

      // Downgrade explicit 'any' from an Error to a Warning
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  oxlint.configs["flat/recommended"],
);
