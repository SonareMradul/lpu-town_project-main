// src/components/Navbar.jsx
import { useState } from "react"
import { useTheme } from "../hooks/useTheme.jsx"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.jsx"
import MobileDrawer from "./MobileDrawer"
import theme from "../theme"

const c = theme.colors

const navLinks = [
  { path: "/home",          label: "Home",          icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
  { path: "/search",        label: "Search",        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { path: "/reels",         label: "Reels",         icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
  { path: "/events",        label: "Events",        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { path: "/messages",      label: "Messages",      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { path: "/notifications", label: "Notifs",        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { path: "/upload",        label: "Create",        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { path: "/profile",       label: "Profile",       icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function Navbar() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isDark, toggle } = useTheme()

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: theme.navbar.height,
        background: "var(--bg-nav)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="hamburger" onClick={() => setDrawerOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: c.textSecondary, padding: 4, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div onClick={() => navigate("/home")} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", boxShadow: theme.shadow.btn }}>L</div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: c.textPrimary }}>
              LPU<span style={{ color: c.primary }}>Town</span>
            </span>
          </div>
        </div>

        {/* Center */}
        <div className="desk-nav" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {navLinks.map(({ path, label, icon }) => {
            const active = location.pathname === path
            return (
              <button key={path} onClick={() => navigate(path)} title={label} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 10px", borderRadius: 10,
                background:  active ? "rgba(99,102,241,0.08)" : "transparent",
                border:      `1px solid ${active ? "rgba(99,102,241,0.20)" : "transparent"}`,
                color:       active ? c.primary : c.textSecondary,
                cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; e.currentTarget.style.color = c.primary } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textSecondary } }}
              >
                {icon}
                <span className="nav-lbl">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggle} title={isDark ? "Light mode" : "Dark mode"} style={{
            width: 32, height: 32, borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: c.textSecondary, flexShrink: 0,
          }}>
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <div onClick={() => navigate("/profile")} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
            padding: 2, cursor: "pointer",
            border: location.pathname === "/profile" ? `2px solid ${c.primary}` : "2px solid transparent",
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.primary }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : profile?.full_name?.charAt(0) || "Y"
              }
            </div>
          </div>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <style>{`
        .hamburger { display: flex !important; }
        .desk-nav  { display: none  !important; }
        @media (min-width: 768px) {
          .hamburger { display: none !important; }
          .desk-nav  { display: flex !important; }
          .nav-lbl   { display: none; }
        }
        @media (min-width: 1024px) {
          .nav-lbl { display: inline !important; }
        }
      `}</style>
    </>
  )
}