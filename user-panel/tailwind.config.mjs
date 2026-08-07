/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
      },
      fontFamily: {
        sans: ['var(--font-roboto-mono)', 'Roboto Mono', 'monospace'],
        mono: ['var(--font-roboto-mono)', 'Roboto Mono', 'monospace'],
        serif: ['var(--font-libertinus-serif)', 'Libertinus Serif', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
