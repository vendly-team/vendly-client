import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        // SF Pro Text on Apple devices via system-ui / -apple-system, Inter elsewhere
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // SF Pro Display on Apple devices, Plus Jakarta Sans / Inter as substitute
        display: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Plus Jakarta Sans",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
        brand: ["Saira Stencil One", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        sale: "hsl(var(--sale))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "1.75rem",
        apple: "1.125rem",
        pill: "9999px",
      },
      boxShadow: {
        // Apple-style layered shadows — subtle, tinted with near-black
        "apple-xs": "0 1px 2px rgba(0,0,0,0.04)",
        "apple-sm": "0 1px 2px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04)",
        "apple-md": "0 2px 4px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)",
        "apple-lg": "0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        "apple-xl": "0 8px 16px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.12)",
        // The single Apple product-render shadow
        "apple-product": "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
        // Soft hairline ring used as button border
        "apple-ring": "0 0 0 1px rgba(0,0,0,0.04)",
        "apple-ring-strong": "0 0 0 1px rgba(0,0,0,0.08)",
        // Focus ring (uses the existing primary token via inset arbitrary value caller-side)
        "apple-focus": "0 0 0 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      },
      letterSpacing: {
        "apple-tight": "-0.022em",
        "apple-tighter": "-0.028em",
        "apple-snug": "-0.014em",
        "apple-wide": "0.012em",
        // User-friendly tracking aliases per spec
        "apple-display": "-0.022em",
        "apple-body": "-0.011em",
        "apple-caption": "-0.006em",
      },
      fontSize: {
        // Apple typography ladder — display sizes use tight tracking
        "apple-hero": ["3.5rem", { lineHeight: "1.07", letterSpacing: "-0.028em", fontWeight: "600" }],
        "apple-display": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.022em", fontWeight: "600" }],
        "apple-title": ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.018em", fontWeight: "600" }],
        "apple-headline": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.014em", fontWeight: "600" }],
        "apple-lead": ["1.3125rem", { lineHeight: "1.38", letterSpacing: "-0.011em", fontWeight: "400" }],
        "apple-body": ["1.0625rem", { lineHeight: "1.47", letterSpacing: "-0.011em", fontWeight: "400" }],
        "apple-caption": ["0.875rem", { lineHeight: "1.43", letterSpacing: "-0.006em", fontWeight: "400" }],
        "apple-fine": ["0.75rem", { lineHeight: "1.33", letterSpacing: "0", fontWeight: "400" }],
        // Short-name aliases per spec
        hero: ["3.5rem", { lineHeight: "1.07", letterSpacing: "-0.028em", fontWeight: "600" }],
        display: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.022em", fontWeight: "600" }],
        title: ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.018em", fontWeight: "600" }],
        headline: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.014em", fontWeight: "600" }],
        lead: ["1.3125rem", { lineHeight: "1.38", letterSpacing: "-0.011em", fontWeight: "400" }],
        body: ["1.0625rem", { lineHeight: "1.47", letterSpacing: "-0.011em", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.43", letterSpacing: "-0.006em", fontWeight: "400" }],
        fine: ["0.75rem", { lineHeight: "1.33", letterSpacing: "0", fontWeight: "400" }],
      },
      spacing: {
        // Apple's generous, predictable rhythm — 8px base
        "apple-xxs": "0.25rem", // 4
        "apple-xs": "0.5rem", // 8
        "apple-sm": "0.75rem", // 12
        "apple-md": "1.0625rem", // 17 (the body line-height anchor)
        "apple-lg": "1.5rem", // 24
        "apple-xl": "2rem", // 32
        "apple-2xl": "3rem", // 48
        "apple-section": "5rem", // 80
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.28, 0.11, 0.32, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
