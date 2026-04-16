/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          tint: "var(--primary-tint)",
        },
        negative: "var(--negative)",
        warning: "var(--warning)",
        // Legacy — landing page + checkout
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        green: {
          DEFAULT: "var(--green)",
          deep: "var(--green-deep)",
          soft: "var(--green-soft)",
        },
      },
      fontFamily: {
        sans: ["Inter Tight", "Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "sans-serif"],
        display: ["Inter Tight", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
