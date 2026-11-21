/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── FundingPips & Cendrix Light Institutional Color Palette ──
        "primary": "#00225A",               // Authoritative deep navy
        "primary-container": "#001944",     // Darker navy for active/hover
        "on-primary": "#ffffff",
        "secondary": "#536CF0",             // Interactive electric blue accent
        "secondary-container": "#EEF3FF",   // Subtle blue container tint
        "on-secondary": "#ffffff",
        "background": "#FCFCFC",            // Crisp clean light background
        "on-background": "#111114",         // Near-black high-contrast text
        "surface": "#FCFCFC",
        "surface-card": "#FFFFFF",          // Pure white card surfaces
        "surface-container": "#F7F8FA",     // Muted surface for panels
        "surface-container-low": "#F7F8FA",
        "surface-container-high": "#EEF3FF",
        "surface-container-highest": "#EAEFF8",
        "on-surface": "#111114",
        "on-surface-variant": "#6B7A90",    // Slate secondary text
        "text-muted": "#6B7A90",
        "text-secondary": "#6B7A90",
        "border-subtle": "#D9E2F2",         // Hairline border
        "outline": "#D9E2F2",
        "outline-variant": "#EAEFF8",
        "bullish": "#12B76A",               // Institutional emerald green
        "bullish-tint": "#ECFDF3",          // Soft green background
        "bearish": "#D92D20",               // Institutional crimson red
        "bearish-tint": "#FEF3F2",          // Soft red background
        "forex-tint": "#EEF3FF",
        "warning": "#F5B800",
        "error": "#D92D20",
        "error-container": "#FEF3F2",
        "on-error": "#ffffff",
        "on-error-container": "#D92D20",

        // Backward compatibility tokens
        saffron: {
          DEFAULT: '#00225A',
          glow: '#536CF0',
          dark: '#001944',
          amber: '#12B76A',
        },
        obsidian: {
          DEFAULT: '#FCFCFC',
          deep: '#FFFFFF',
          subtle: '#D9E2F2',
        },
        charcoal: {
          DEFAULT: '#FFFFFF',
          light: '#F7F8FA',
          border: '#D9E2F2',
          borderSubtle: '#EAEFF8',
          borderOrange: '#536CF0',
        },
        razor: {
          DEFAULT: '#111114',
          muted: '#6B7A90',
          steel: '#4B5563',
          dark: '#94A3B8',
        },
      },
      spacing: {
        "margin": "1.5rem",
        "space-xl": "2rem",
        "space-xs": "0.25rem",
        "gutter": "1rem",
        "space-lg": "1.5rem",
        "space-sm": "0.5rem",
        "space-md": "1rem"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        headline: ["DM Sans", "sans-serif"],
        "headline-lg": ["DM Sans", "sans-serif"],
        "headline-md": ["DM Sans", "sans-serif"],
        "headline-sm": ["DM Sans", "sans-serif"],
        "title-md": ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "mono-lg": ["JetBrains Mono", "monospace"],
        "mono-md": ["JetBrains Mono", "monospace"],
        "mono-sm": ["JetBrains Mono", "monospace"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-sm": ["18px", { "lineHeight": "26px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "mono-lg": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-sm": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "title-md": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
        "mono-md": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.025em", "fontWeight": "700" }],
        "mono-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
        "headline-lg": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.03em", "fontWeight": "700" }]
      },
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(0, 34, 90, 0.05)",
        "subtle": "0 1px 3px 0 rgba(0, 34, 90, 0.05), 0 1px 2px -1px rgba(0, 34, 90, 0.05)",
        "card": "0 2px 12px rgba(0, 34, 90, 0.04)",
        "elevated": "0 8px 30px rgba(0, 34, 90, 0.08)",
        "dropdown": "0 10px 25px -5px rgba(0, 34, 90, 0.1), 0 8px 10px -6px rgba(0, 34, 90, 0.06)",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
}
