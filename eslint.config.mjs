import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
    languageOptions: {
      globals: {
        // Node.js globals (Electron main process)
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
        // Browser globals (renderer)
        window: "readonly",
        document: "readonly",
        console: "readonly",
        // Electron webpack globals
        MAIN_WINDOW_WEBPACK_ENTRY: "readonly",
        MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: "readonly",
      },
    },
  },
  {
    ignores: [
      ".webpack/**",
      "out/**",
      "node_modules/**",
      "dist/**",
      "*.config.js",
      "*.config.ts",
      "forge.config.ts",
      "webpack.*.ts",
    ],
  },
);