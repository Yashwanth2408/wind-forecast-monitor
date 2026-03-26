import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'Roboto Mono'", "monospace"],
      },
      colors: {
        d: {
          bg: "#0f0e17",
          surface: "#1a1829",
          s2: "#211f32",
          s3: "#2a2840",
          border: "rgba(255,255,255,0.07)",
          border2: "rgba(255,255,255,0.12)",
          text: "#e4e3f0",
          text2: "#8b8ba8",
          text3: "#5a5a70",
        },
        accent: {
          orange: "#ff6533",
          "orange-dim": "rgba(255,101,51,0.12)",
          purple: "#7c6fe0",
          "purple-dim": "rgba(124,111,224,0.12)",
          green: "#4ade80",
          "green-dim": "rgba(74,222,128,0.12)",
          blue: "#60a5fa",
          "blue-dim": "rgba(96,165,250,0.12)",
          red: "#f87171",
          "red-dim": "rgba(248,113,113,0.12)",
        },
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
