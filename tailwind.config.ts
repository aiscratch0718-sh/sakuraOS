import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-mplus-rounded)",
          "M PLUS Rounded 1c",
          "Hiragino Maru Gothic Pro",
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // Surfaces
        bg: "#e8f0f8",
        panel: "#ffffff",
        panel2: "#f5f8fc",
        // Brand
        navy: { DEFAULT: "#1a3a6a", 2: "#2a5a9a" },
        brand: { yellow: "#f5d800" },
        // Action / status
        blue: { DEFAULT: "#2568c8", 2: "#4a8ae8", bg: "#ddeeff" },
        teal: { DEFAULT: "#0da870", 2: "#12c882", bg: "#d0f5e8" },
        pink: { DEFAULT: "#d46a88", 2: "#e889a5", bg: "#ffe5ec" },
        red: { DEFAULT: "#e03030", bg: "#ffd8d8" },
        amber: { DEFAULT: "#d88000", 2: "#f8a820", bg: "#fff0c8" },
        purple: { DEFAULT: "#7040c8", bg: "#ede8ff" },
        // Text
        ink: { DEFAULT: "#1a2a3a", 2: "#4a6080", 3: "#7890a8" },
        // Structure
        line: "#c8d8e8",
        graybg: "#eef2f7",
      },
      borderRadius: {
        panel: "10px",
        btn: "6px",
        pill: "20px",
      },
      boxShadow: {
        head: "0 2px 8px rgba(0,0,0,0.15)",
        card: "0 2px 8px rgba(0,0,0,0.06)",
        cardHover: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
