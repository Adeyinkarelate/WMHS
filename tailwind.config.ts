import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A56B0",
          light: "#4A7EC8",
          dark: "#13448C",
          soft: "#E8F0FA",
        },
        gold: {
          DEFAULT: "#D4BC8A",
          dark: "#B89E6C",
        },
        "gold-dark": "#B89E6C",
        success: {
          DEFAULT: "#1F7A4D",
          soft: "#E6F4EC",
          ink: "#145C39",
        },
        warning: {
          DEFAULT: "#B87814",
          soft: "#F7F0E0",
          ink: "#7A4E0C",
        },
        danger: {
          DEFAULT: "#B42318",
          dark: "#8F1C13",
          soft: "#F8E8E6",
          ink: "#8A1B14",
        },
        navy: {
          DEFAULT: "#0B1F3A",
          muted: "#163A66",
        },
        sage: {
          DEFAULT: "#2F6B5D",
          light: "#E7F1EE",
        },
        blush: {
          DEFAULT: "#9B4D42",
          soft: "#F3E8E5",
        },
        canvas: {
          DEFAULT: "#F3F5F8",
          card: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#132033",
          muted: "#5B6B7C",
        },
        line: {
          DEFAULT: "#D4DCE6",
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        serif: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "1.15", fontWeight: "700" }],
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.65", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.875rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 31, 58, 0.04), 0 8px 24px rgba(11, 31, 58, 0.06)",
        lift: "0 16px 40px rgba(11, 31, 58, 0.12)",
        glow: "0 0 0 4px rgba(26, 86, 176, 0.16)",
        soft: "0 22px 64px rgba(11, 31, 58, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "scale-in": "scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      backgroundImage: {
        "mesh-warm":
          "radial-gradient(980px 480px at 6% -18%, rgba(26, 86, 176, 0.07), transparent 58%), radial-gradient(820px 420px at 100% -6%, rgba(47, 107, 93, 0.05), transparent 52%)",
      },
    },
  },
  plugins: [],
};

export default config;
