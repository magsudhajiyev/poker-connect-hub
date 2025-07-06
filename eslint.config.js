import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "backend/dist", "backend/node_modules", ".history", "**/.history/**"] },
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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-unused-vars": "off", // Using @typescript-eslint/no-unused-vars instead
      "@typescript-eslint/no-explicit-any": "warn",
      
      // General code quality rules
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-expressions": "error",
      "no-duplicate-imports": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // React specific rules
      "react-hooks/exhaustive-deps": "warn",
      
      // Code style rules
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "comma-dangle": ["error", "always-multiline"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      
      // Performance and best practice rules
      "no-implicit-coercion": "error",
      "no-unneeded-ternary": "error",
      "object-shorthand": "error",
      "prefer-template": "error"
    },
  }
);
