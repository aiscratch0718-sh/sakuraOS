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
        navy: { DEFAULT: "#1a3a6a", 2: "#2a5a9a", rich: "#1A2740" },
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
        // === Gamification palette (demo v4.0) ===
        // 注: ゲーミフィケーション(クエスト・バッジ・パワプロ風ステータス)専用に温存
        // 業務画面では status.* / red / teal / amber / blue / purple を優先使用
        p1: { DEFAULT: "#D9415A", light: "#FDEEF1" },
        p2: { DEFAULT: "#C47A00", light: "#FEF5E4" },
        p3: { DEFAULT: "#0A8F6E", light: "#E4F7F2" },
        p4: { DEFAULT: "#5B3FA8", light: "#F0EAFB" },
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        // === REPORT3 ロゴ用赤橙グラデ(参照データ S5 由来) ===
        report3: { from: "#E8516A", to: "#F5A45A" },
        // === 状態セマンティック色(参照データ S5 由来) ===
        // 業務画面で意味的に使う(active=進行中, done=完了, warn=注意, urgent=緊急)
        status: {
          active: "#E03030",   // = red.DEFAULT
          done: "#0DA870",     // = teal.DEFAULT
          warn: "#D88000",     // = amber.DEFAULT
          urgent: "#B91C1C",
        },
      },
      borderRadius: {
        panel: "10px",
        // 参照データ S5: カード 12px / 大カード 16px / pill 20px に統一
        card: "12px",
        cardLg: "16px",
        btn: "6px",
        pill: "20px",
      },
      boxShadow: {
        head: "0 2px 8px rgba(0,0,0,0.15)",
        card: "0 2px 8px rgba(11,31,69,0.06)",
        cardHover: "0 8px 24px rgba(11,31,69,0.1)",
        cardLg: "0 24px 80px rgba(0,0,0,0.4)",
        // Gamification glows
        "p1-glow": "0 4px 12px rgba(217,65,90,0.3)",
        "p2-glow": "0 4px 12px rgba(196,122,0,0.3)",
        "p3-glow": "0 4px 12px rgba(10,143,110,0.3)",
        "p4-glow": "0 4px 12px rgba(91,63,168,0.3)",
        gold: "0 4px 12px rgba(255,215,0,0.4)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 8px rgba(10,143,110,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(10,143,110,0.6)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        barFill: {
          "0%": { width: "0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s cubic-bezier(0.4,0,0.2,1) both",
        slideIn: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        glowPulse: "glowPulse 2s ease-in-out infinite",
        floatSlow: "floatSlow 2.5s ease-in-out infinite",
        countUp: "countUp 0.6s cubic-bezier(0.2,0,0,1.5) both",
        barFill: "barFill 1.2s cubic-bezier(0.2,0,0,1.5) both",
      },
    },
  },
  plugins: [],
};

export default config;
