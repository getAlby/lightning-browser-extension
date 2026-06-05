module.exports = {
  "src/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
  ],
  "**/*.{md,json}": ["prettier --write"],
  "src/**/*.{ts,tsx}": () => "tsc --noEmit",
};
