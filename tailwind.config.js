const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

function lighten(color, percent) {
  var num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = ((num >> 8) & 0x00ff) + amt,
    G = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const surfaceColor = "#121212";

module.exports = {
  darkMode: "class",
  content: ["./static/views/**/*.html", "./src/app/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".translate-z-0": {
          transform: "translateZ(0)",
        },
      };
      addUtilities(newUtilities);
    }),
    require("@tailwindcss/forms"),
  ],
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin 0.7s linear infinite",
      },
      fontFamily: {
        sans: ["Open Runde", ...defaultTheme.fontFamily.sans],
        serif: ["Catamaran", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxxs: ".5rem",
        xxs: ".625rem",
      },
      screens: {
        short: { raw: "(max-height: 800px)" },
      },
      spacing: {
        18: "4.5rem",
      },
      colors: {
        primary: "#F8C455",
        "brand-yellow": "#FFDF6F",
        "green-bitcoin": "#27ae60",

        // Material Design Surface Colors
        "surface-00dp": surfaceColor,
        "surface-01dp": lighten(surfaceColor, 5),
        "surface-02dp": lighten(surfaceColor, 7),
        "surface-08dp": lighten(surfaceColor, 12),
        "surface-12dp": lighten(surfaceColor, 14),
        "surface-16dp": lighten(surfaceColor, 15),
      },
    },
    backgroundImage: (theme) => ({
      "primary-gradient": `linear-gradient(180deg, #FFDE6E 63%, #F8C455 95%)`,
      "primary-gradient-hover": `linear-gradient(180deg, #F2D369 63%, #ECBA51 95%)`,
    }),
  },
};
