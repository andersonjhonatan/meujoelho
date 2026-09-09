import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#2c3e50",
        brand: "#2e86ab",
        care: "#e67e22",
        danger: "#e74c3c",
        okgreen: "#27ae60",
        soft: "#eef3f7",
      },
      fontFamily: { sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
