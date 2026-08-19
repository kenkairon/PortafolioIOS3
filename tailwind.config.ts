import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          blue: "#007AFF",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          purple: "#AF52DE",
          indigo: "#5E5CE6",
          teal: "#40C8E0",
          yellow: "#FFD60A",
          gray: "#8E8E93",
          text: "#1C1C1E",
          textSub: "#6E6E73",
        },
      },
      fontFamily: {
        sf: [
          "-apple-system",
          "SF Pro Text",
          "SF Pro Display",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        squircle: "26%",
        sheet: "34px",
      },
      boxShadow: {
        ios: "0 20px 50px rgba(0,0,0,0.25)",
        icon: "0 3px 8px rgba(0,0,0,0.25)",
      },
      keyframes: {
        "sheet-up": {
          "0%": { opacity: "0", transform: "translateY(60px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "bounce-cat": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "sheet-up": "sheet-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        "bounce-cat": "bounce-cat 2.4s ease-in-out infinite",
        "pop-in": "pop-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
