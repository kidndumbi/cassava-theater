// import { type Config } from "prettier";

// const config: Config = {
//   trailingComma: "none",
//   plugins: [
//     "prettier-plugin-tailwindcss"]
// };

// module.exports = config;
// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // trailingComma: "es5",
  // tabWidth: 4,
  // semi: false,
  // singleQuote: true,
  plugins: [
    "prettier-plugin-tailwindcss",
  ],
};

module.exports = config;