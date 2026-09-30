import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: "#1f77b4", ink: "#2c3e50" } } },
  plugins: [],
};
export default config;
