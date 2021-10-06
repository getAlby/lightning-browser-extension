const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    {
      name: "@storybook/addon-postcss",
      options: {
        postcssLoaderOptions: {
          implementation: require("postcss"),
        },
      },
    },
  ],
  webpackFinal: async (config) => {
    // TODO: load from package once the lib supports it
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "./node_modules/html5-qrcode/dist",
            to: "./html5-qrcode-dist/",
          },
        ],
      })
    );

    config.module.rules.push({
      test: /\,css&/,
      use: [
        {
          loader: "postcss-loader",
          options: {
            ident: "postcss",
            plugins: [require("tailwindcss"), require("autoprefixer")],
          },
        },
      ],
      include: path.resolve(__dirname, "../"),
    });
    return config;
  },

  // Temp fix for: TypeError: (tag.text || "").trim is not a function #356
  // https://github.com/styleguidist/react-docgen-typescript/issues/356
  typescript: {
    reactDocgen: "react-docgen",
  },
};
