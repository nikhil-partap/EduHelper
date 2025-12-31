/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        darkBase: "#0f1115",
        darkElevated: "#151821",
        cardLight: "#f8fafc",
        cardSuccess: "#ecfdf5",
        textDark: "#e5e7eb",
        textMuted: "#9ca3af",
        primary: "#2563eb",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
