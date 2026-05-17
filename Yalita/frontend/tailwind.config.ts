import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy quipu- tokens pointing to new CSS vars
        quipu: {
          primary: "var(--y-primary)",
          secondary: "var(--y-amber)",
          dark: "var(--y-navy)",
          light: "var(--y-bg)",
          accent: "var(--y-green)",
          text: "var(--y-text-primary)",
        },
        // New y- design tokens
        'y-primary': 'var(--y-primary)',
        'y-navy': 'var(--y-navy)',
        'y-amber': 'var(--y-amber)',
        'y-green': 'var(--y-green)',
        'y-aqua': 'var(--y-aqua)',
        'y-bg': 'var(--y-bg)',
        'y-surface': 'var(--y-surface)',
        'y-surface-alt': 'var(--y-surface-alt)',
        'y-border': 'var(--y-border)',
        'y-text': 'var(--y-text-primary)',
        'y-text-muted': 'var(--y-text-secondary)',
        'y-text-tertiary': 'var(--y-text-tertiary)',
        // Tiers de score
        score: {
          excellent: "#22c55e", good: "#84cc16", fair: "#f59e0b",
          poor: "#ef4444", blocked: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        lora: ["var(--font-lora)", "Lora", "Georgia", "serif"],
      },
      animation: {
        "score-reveal": "scoreReveal 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-up": "fadeUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        scoreReveal: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
