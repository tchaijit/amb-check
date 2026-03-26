import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        secondary: "#00a8e8",
        success: "#00c851",
        warning: "#ffbb33",
        danger: "#ff4444",
      },
    },
  },
  plugins: [],
} satisfies Config;
