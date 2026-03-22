import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Semantic tokens map tới palette hiện tại (emerald + slate).
 * Đổi theme sau này: chỉnh mapping dưới đây (hoặc chuyển sang var(--*) trong globals.css).
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: colors.slate[200],
        input: colors.slate[200],
        surface: colors.white,
        placeholder: colors.slate[400],
        focusRing: colors.emerald[500],
        muted: {
          DEFAULT: colors.slate[50],
          foreground: colors.slate[500],
          elevated: colors.slate[100],
          strong: colors.slate[600],
        },
        foreground: {
          DEFAULT: colors.slate[800],
          muted: colors.slate[700],
        },
        primary: {
          DEFAULT: colors.emerald[600],
          hover: colors.emerald[700],
          muted: colors.emerald[50],
          foreground: colors.emerald[800],
        },
        danger: {
          DEFAULT: colors.red[50],
          foreground: colors.red[800],
        },
      },
      borderRadius: {
        card: "1rem",
        control: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
