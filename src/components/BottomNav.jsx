// src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom"
import theme from "../theme"

const PRIMARY = "#6366f1"
const MUTED   = "#9ca3af"

const items = [
  { path:"/home",    label:"Home",    icon:(a) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?PRIMARY:"none"} stroke={a?PRIMARY:MUTED} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { path:"/search",  label:"Search",  icon:(a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?PRIMARY:MUTED} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { path:"/upload",  label:"Create",  isCreate:true, icon:() => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  { path:"/reels",   label:"Reels",   icon:(a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?PRIMARY:MUTED} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
  { path:"/profile", label:"Profile", icon:(a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?PRIMARY:MUTED} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: theme.bottomNav.height, zIndex: 50,
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: "space-around",
        padding: "0 4px 6px",
      }} className="bottom-nav">
        {items.map(({ path, label, icon, isCreate }) => {
          const active = location.pathname === path
          return (
            <div key={path} onClick={() => navigate(path)} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, cursor: "pointer",
              padding: isCreate ? 0 : "6px 14px",
              borderRadius: 12,
              color: active ? PRIMARY : MUTED,
            }}>
              {isCreate ? (
                <div style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: `linear-gradient(135deg, ${theme.colors.gradientA}, ${theme.colors.gradientB})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: theme.shadow.btn,
                }}>
                  {icon(active)}
                </div>
              ) : (
                <>
                  {icon(active)}
                  <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
                </>
              )}
            </div>
          )
        })}
      </nav>

      <style>{`
        .bottom-nav { display: flex; }
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}