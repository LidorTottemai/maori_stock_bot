import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shop/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          light: "#ede9fe",
          muted: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
