import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        by: {
          dark: "#331E1E",
          darkHover: "#422828",
          darkActive: "#241414",
          green: "#A2FC4B",
          greenHover: "#91e73e",
          greenLight: "#EEFCD9",
          greenMuted: "#d7f7aa",
          bg: "#F6FAF0",
          card: "#FFFFFF",
          border: "#E2EAD6",
          borderDark: "#3d2525",
          muted: "#706161",
          subtle: "#8A7979",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        by: "0 2px 8px -2px rgba(51, 30, 30, 0.06), 0 4px 16px -4px rgba(51, 30, 30, 0.08)",
        "by-lg": "0 10px 25px -5px rgba(51, 30, 30, 0.1), 0 8px 10px -6px rgba(51, 30, 30, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
