import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Moniq brand palette — inspired by UP Bank's bold aesthetic
        // Primary: Deep teal/emerald feel with vibrant coral accent
        moniq: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#5ceacb",
          400: "#2dd4b3",
          500: "#14b89a",
          600: "#0d9480",
          700: "#0f7668",
          800: "#115e54",
          900: "#134e46",
          950: "#042f2b",
        },
        coral: {
          50: "#fff5f2",
          100: "#ffe8e1",
          200: "#ffd5c8",
          300: "#ffb5a0",
          400: "#ff8c6b",
          500: "#ff6b3d",
          600: "#f04e1e",
          700: "#ca3c14",
          800: "#a33316",
          900: "#862f18",
          950: "#491508",
        },
        navy: {
          50: "#f0f4fd",
          100: "#e0e8fa",
          200: "#c8d5f6",
          300: "#a3b8ef",
          400: "#7892e5",
          500: "#5a6fdb",
          600: "#4553cf",
          700: "#3b43bd",
          800: "#35399a",
          900: "#2f347a",
          950: "#0f1129",
        },
        // Dark theme surface colors
        surface: {
          DEFAULT: "#0a0f14",
          50: "#f5f7fa",
          100: "#ebeef3",
          200: "#d2d9e3",
          300: "#abb8ca",
          400: "#7e92ac",
          500: "#5e7593",
          600: "#4a5e7a",
          700: "#3d4d63",
          800: "#354254",
          900: "#1a2332",
          950: "#0a0f14",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "gradient": "gradient 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
