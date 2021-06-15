const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "orange-bitcoin": "#f7931a",
        "orange-bitcoin-h": "#f68b0a",
        "red-bitcoin": "#eb5757",
        "green-bitcoin": "#27ae60",
        "blue-bitcoin": "#2d9cdb",
        "purple-bitcoin": "#bb6bd9",
      },
    },
  },
};
