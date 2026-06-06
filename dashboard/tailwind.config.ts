import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        h: {
          bg: "#0a0a0a",
          card: "#111111",
          border: "#1e1e1e",
          fuchsia: "#FF006E",
          "fuchsia-dim": "#cc0058",
          muted: "#6b7280",
          text: "#f0f0f0",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
