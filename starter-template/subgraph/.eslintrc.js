module.exports = {
  extends: "eslint:recommended",
  parser: "babel-eslint",
  env: {
    amd: true,
    node: true,
    es6: true
  },
  rules: {
    "eol-last": 2,
    eqeqeq: "error",
    "no-console": 0,
    "no-var-requires": 0
  }
};
