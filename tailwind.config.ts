import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
        fredoka: ['var(--font-fredoka)', 'cursive'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#ff69b4",
        secondary: "#8a2be2",
        gameBg: "#2d1b4e", // Dark purple for stage background
        gamePanel: "rgba(255, 255, 255, 0.9)", // Glass panel
      },
      boxShadow: {
        '3d-btn': '0 4px 0 0 rgba(0, 0, 0, 0.2), 0 8px 10px 0 rgba(0,0,0,0.1)',
        '3d-btn-pressed': '0 0px 0 0 rgba(0, 0, 0, 0.2), 0 2px 5px 0 rgba(0,0,0,0.1)',
        'neon-pink': '0 0 10px #ff69b4, 0 0 20px #ff69b4, 0 0 30px #ff69b4',
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(255,105,180,0.8))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 2px rgba(255,105,180,0.3))' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
