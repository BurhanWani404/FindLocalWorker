module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended"], // Remove "google"
  rules: {
    "max-len": ["error", { "code": 120 }], // Increase line length limit
    "require-jsdoc": "off", // Disable JSDoc requirement
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  },
  
  parserOptions: {
    "ecmaVersion": 2018,
  },
  
  
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
