const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "orange-bitcoin": "#f7931a",
        "red-bitcoin": "#eb5757",
        "green-bitcoin": "#27ae60",
        "blue-bitcoin": "#2d9cdb",
        "purple-bitcoin": "#bb6bd9"
      },
    },
  },
};
