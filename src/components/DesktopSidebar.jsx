// src/components/DesktopSidebar.jsx
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors


const items = [
  { path: "/home",          label: "Home",        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
  { path: "/search",        label: "Search",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { path: "/reels",         label: "Reels",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
  { path: "/events",        label: "Events",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { path: "/messages",      label: "Messages",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { path: "/notifications", label: "Notifications", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { path: "/upload",        label: "Create Post", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { path: "/communities",   label: "Communities", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { path: "/lostfound",     label: "Lost & Found", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { path: "/roommates",     label: "PG Finder",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { path: "/profile",       label: "Profile",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function DesktopSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, logout } = useAuth()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      position: "sticky",
      top: `calc(${theme.navbar.height} + 20px)`,
      height: `calc(100vh - ${theme.navbar.height} - 40px)`,
      display: "flex", flexDirection: "column",
      padding: "4px 0",
    }}>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ path, label, icon }) => {
          const active = location.pathname === path
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 12,
              background:  active ? "rgba(99,102,241,0.08)" : "var(--bg-page)",
              border:      `1px solid ${active ? "rgba(99,102,241,0.20)" : "var(--bg-page)"}`,
              color:       active ? c.primary : c.textSecondary,
              cursor:      "pointer", fontSize: 14,
              fontWeight:  active ? 600 : 400,
              textAlign:   "left", width: "100%",
              transition:  "all 0.15s ease",
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.color = c.primary; e.currentTarget.style.transform = "translateX(3px)" } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "var(--bg-page)"; e.currentTarget.style.color = c.textSecondary; e.currentTarget.style.transform = "translateX(0)" } }}
            >
              {icon}
              {label}
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: c.primary }} />}
            </button>
          )
        })}
      </nav>

      {/* Profile card at bottom */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 2, flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c.primary }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : profile?.full_name?.charAt(0) || "Y"}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: c.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name}</p>
          <p style={{ fontSize: 10, color: c.textMuted }}>@{profile?.username}</p>
        </div>
        <button onClick={logout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, padding: 4, borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = c.error}
          onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  )
}