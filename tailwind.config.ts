import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef0ff",
          100: "#dce0ff",
          200: "#b8bfff",
          400: "#6b74f0",
          500: "#4d55ec",
          600: "#2e38db",
          700: "#1e27a8",
          800: "#151d7a",
          900: "#0c1152",
          950: "#06092e",
        },
        navy: {
          600: "#1d3a8a",
          700: "#0a1044",
          800: "#060a2e",
          950: "#020831",
        },
        accent: {
          50: "#f3eeff",
          500: "#7800f0",
          600: "#5a00b8",
          800: "#3d007a",
          900: "#1f003d",
        },
        surface: "#f8f8fc",
        muted: "#6b6b8a",
        success: {
          50: "#eaf6ee",
          600: "#1d7a44",
        },
        warning: {
          50: "#fdf2e3",
          600: "#a3650a",
        },
        danger: {
          50: "#fbeaea",
          600: "#a82424",
        },
        sector: {
          50: "#eef0fb",
          600: "#4a4fb0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-hero": "2.25rem",
        "display-page": "1.875rem",
        "heading-card": "1.5rem",
        "heading-section": "1.25rem",
        "label-ui": "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
