// eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,

  {
    ignores: ["dist/*"],
  },

  // 👇 ADD THIS BLOCK
  {
    files: ["*.cjs", "metro.config.cjs"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
  },
]);
