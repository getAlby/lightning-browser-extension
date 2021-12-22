const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./static/views/**/*.html", "./src/app/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin 0.7s linear infinite",
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
        serif: ["Catamaran", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxxs: ".5rem",
        xxs: ".625rem",
      },
      colors: {
        "orange-bitcoin": "#f7931a",
        "orange-bitcoin-700": "#e78308",
        "red-bitcoin": "#eb5757",
        "green-bitcoin": "#27ae60",
        "blue-bitcoin": "#2d9cdb",
        "purple-bitcoin": "#bb6bd9",
        "gray-bitcoin": "#F7F6F4",
        "light-green-bitcoin": "#27AE60",
        "light-gray-bitcoin": "#F3F4F6",
        "dark-bitcoin": "#434343",
        "dark-text-bitcoin": "#3A3A3A",
        "text-gray-bitcoin": "#878988",
      },
    },
  },
};
