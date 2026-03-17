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
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // Dark theme
        dark: {
          bg: "#080C14",
          surface: "#0D1321",
          "surface-2": "#111827",
          "surface-3": "#1a2235",
          border: "#1e2d45",
          "border-2": "#253550",
        },
        // Light theme
        light: {
          bg: "#F4F7FB",
          surface: "#FFFFFF",
          "surface-2": "#F0F4FA",
          "surface-3": "#E8EEF8",
          border: "#D1DCF0",
          "border-2": "#B8CCE8",
        },
        brand: {
          blue: "#3B82F6",
          "blue-dim": "#2563EB",
          green: "#10B981",
          "green-dim": "#059669",
          red: "#EF4444",
          amber: "#F59E0B",
          purple: "#8B5CF6",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "card-dark": "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,45,69,0.8)",
        "card-light": "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(209,220,240,0.8)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.2)",
        "glow-green": "0 0 20px rgba(16,185,129,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
