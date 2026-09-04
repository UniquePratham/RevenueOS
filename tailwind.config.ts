import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Mastercard Design System
        mc: {
          primary: "#141413",
          secondary: "#6B6862",
          tertiary: "#EB001B",
          neutral: "#F5EFE2",
          surface: "#FFF9EC",
          "surface-alt": "#F0EAE0",
          border: "#E3DDD2",
          "border-subtle": "#ECE6DC",
          "on-primary": "#FFF9EC",
          red: "#EB001B",
          "red-subtle": "#FBEAEB",
          green: "#1E824C",
          "green-subtle": "#EBF5EF",
          amber: "#D97706",
          "amber-subtle": "#FEF3C7",
        },
        // Mapped fintech aliases for smooth backward compatibility
        fintech: {
          navy: "#F5EFE2",
          dark: "#EFE8DA",
          card: "#FFF9EC",
          border: "#E3DDD2",
          accent: "#EB001B",
          neon: "#EB001B",
          green: "#1E824C",
          amber: "#D97706",
          rose: "#EB001B",
          purple: "#5B4466",
        }
      },
      borderRadius: {
        pill: "100px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.25s ease-in-out",
        "scale-up": "scaleUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
