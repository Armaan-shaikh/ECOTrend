/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: "#0B131E",
          card: "#121E2D",
          border: "#1E2D40",
          hover: "#1A293D",
          accent: "#10B981",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        }
      }
    },
  },
  plugins: [],
}
