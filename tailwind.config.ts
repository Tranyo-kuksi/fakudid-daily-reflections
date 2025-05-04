
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        fakudid: {
          purple: "#9b87f5",
          darkPurple: "#7a66d9",
        },
        mood: {
          dead: "#ea384c",     // Red
          sad: "#F97316",      // Orange
          meh: "#0EA5E9",      // Blue
          good: "#16A34A",     // Green
          awesome: "#EAB308",  // Gold/Yellow
        },
        gold: {
          light: "#FFEB8A",    // Bright Yellow
          medium: "#FFDA56",   // Medium Yellow
          dark: "#FFC107",     // Deep Yellow
        },
        // Updated theme colors
        theme: {
          // Light themes
          lavender: {
            light: "#E5DEFF",
            dark: "#C9BEF2",
          },
          mint: {
            light: "#F2FCE2",
            dark: "#D3ECD1",
          },
          peach: {
            light: "#FFDAB9",
            dark: "#F5B086",
          },
          sky: {
            light: "#E0F7FA",
            dark: "#79D8E6",
          },
          // Updated Bubblegum theme with #f07fb7 pink
          bubblegum: {
            light: "#f8b0d3",
            dark: "#f07fb7",
          },
          // Updated Golden Hour theme with darker gold
          "golden-hour": {
            light: "#dfb563",
            dark: "#b78d37",
          },
          // Dark themes
          midnight: {
            light: "#2c3e50",
            dark: "#1a2530",
          },
          forest: {
            light: "#2E4045",
            dark: "#1D2B30",
          },
          plum: {
            light: "#4A3B4B",
            dark: "#342A35",
          },
          ocean: {
            light: "#33C3F0",
            dark: "#1EAEDB",
          }
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, var(--background)))",
          foreground: "hsl(var(--sidebar-foreground, var(--foreground)))",
          border: "hsl(var(--sidebar-border, var(--border)))",
          accent: "hsl(var(--sidebar-accent, var(--muted)))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, var(--muted-foreground)))",
          ring: "hsl(var(--sidebar-ring, var(--ring)))",
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFEB8A 0%, #FFDA56 50%, #FFC107 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
