import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rosewood: "#9f5366",
        blush: "#f8dfe7",
        nude: "#f4e8df",
        cocoa: "#5c4744",
        linen: "#fffaf7",
        shell: "#fbf7f4",
        mist: "#f1ece8",
        ink: "#342927"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(92, 71, 68, 0.10)",
        panel: "0 1px 2px rgba(92, 71, 68, 0.06), 0 18px 48px rgba(92, 71, 68, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
