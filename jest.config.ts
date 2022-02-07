module.exports = {
  verbose: true,
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  setupFiles: [
    "jest-webextension-mock"
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    "./jest.setup.ts"
  ]
};
