/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0f0d1a",
        violet: { DEFAULT: "#8b5cf6" },
        electric: "#06b6d4",
        hotpink: "#ec4899",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
