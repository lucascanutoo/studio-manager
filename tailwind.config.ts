import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rosewood: "#9f5366",
        blush: "#f7dce4",
        nude: "#f4e8df",
        cocoa: "#6e5450",
        linen: "#fffaf7"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(110, 84, 80, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
