module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: {
          950: "#050816",
          900: "#0a1020",
          800: "#11162a",
          700: "#19203a",
        },
        neon: {
          blue: "#66d9ff",
          purple: "#9d7dff",
          aqua: "#3cf2d8",
        },
      },
      boxShadow: {
        glow: "0 0 60px rgba(102, 217, 255, 0.18)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "glass-panel":
          "linear-gradient(135deg, rgba(13,18,38,0.78), rgba(8,12,24,0.48))",
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.68" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};