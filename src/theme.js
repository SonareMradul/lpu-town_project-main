// src/theme.js
const THEME = "purple"

const presets = {
  purple: { primary:"#6366f1", primaryHover:"#4f46e5", primaryLight:"rgba(99,102,241,0.08)", primaryGlow:"rgba(99,102,241,0.25)", gradientA:"#6366f1", gradientB:"#8b5cf6", gradientC:"#ec4899" },
  blue:   { primary:"#3b82f6", primaryHover:"#2563eb", primaryLight:"rgba(59,130,246,0.08)",  primaryGlow:"rgba(59,130,246,0.25)",  gradientA:"#3b82f6", gradientB:"#06b6d4", gradientC:"#6366f1" },
  green:  { primary:"#10b981", primaryHover:"#059669", primaryLight:"rgba(16,185,129,0.08)",  primaryGlow:"rgba(16,185,129,0.25)",  gradientA:"#10b981", gradientB:"#3b82f6", gradientC:"#6366f1" },
  rose:   { primary:"#f43f5e", primaryHover:"#e11d48", primaryLight:"rgba(244,63,94,0.08)",   primaryGlow:"rgba(244,63,94,0.25)",   gradientA:"#f43f5e", gradientB:"#f97316", gradientC:"#eab308" },
  amber:  { primary:"#f59e0b", primaryHover:"#d97706", primaryLight:"rgba(245,158,11,0.08)",  primaryGlow:"rgba(245,158,11,0.25)",  gradientA:"#f59e0b", gradientB:"#ef4444", gradientC:"#ec4899" },
  teal:   { primary:"#0d9488", primaryHover:"#0f766e", primaryLight:"rgba(13,148,136,0.08)",  primaryGlow:"rgba(13,148,136,0.25)",  gradientA:"#0d9488", gradientB:"#3b82f6", gradientC:"#8b5cf6" },
}

const p = presets[THEME] || presets.purple

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `${r},${g},${b}`
}

const theme = {
  appName:    "LPUTown",
  appTagline: "The Official Student Network",

  colors: {
    // Accent — always same
    primary:       p.primary,
    primaryHover:  p.primaryHover,
    primaryLight:  p.primaryLight,
    primaryGlow:   p.primaryGlow,
    gradientA:     p.gradientA,
    gradientB:     p.gradientB,
    gradientC:     p.gradientC,
    borderAccent:  `rgba(${hexToRgb(p.primary)},0.20)`,
    success:       "#10b981",
    error:         "#ef4444",
    warning:       "#f59e0b",

    // Text — CSS variables so dark mode works automatically
    textPrimary:   "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    textMuted:     "var(--text-muted)",

    // Backgrounds — CSS variables
    bgPage:        "var(--bg-page)",
    bgCard:        "var(--bg-card)",
    bgGlass:       "var(--bg-card)",
    bgGlassStrong: "var(--bg-elevated)",
    bgGlassDim:    "var(--bg-card)",
    bgInput:       "var(--bg-input)",
    bgNav:         "var(--bg-nav)",
    bgElevated:    "var(--bg-elevated)",

    // Borders
    border:        "var(--border)",
    borderSoft:    "var(--border)",

    // Overlay
    overlay:       "var(--bg-overlay)",

    // Shadows
    shadowCard:    "var(--shadow-card)",
    shadowHover:   "var(--shadow-hover)",
  },

  blur:      "none",
  blurLight: "none",

  radius: { sm:"8px", md:"12px", lg:"16px", xl:"20px", full:"9999px" },

  shadow: {
    card:  "var(--shadow-card)",
    hover: "var(--shadow-hover)",
    btn:   `0 4px 14px ${p.primaryGlow}`,
  },

  navbar:    { height:"56px" },
  bottomNav: { height:"62px" },
}

export default theme