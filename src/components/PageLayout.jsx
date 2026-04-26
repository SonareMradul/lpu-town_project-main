// src/components/PageLayout.jsx
import Navbar from "./Navbar"
import BottomNav from "./BottomNav"
import DesktopSidebar from "./DesktopSidebar"
import useIsMobile from "../hooks/useIsMobile"
import theme from "../theme"

export default function PageLayout({ children, maxWidth = 680 }) {
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", top: -80, right: -60 }} />
        <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", bottom: 80, left: -50 }} />
      </div>

      <Navbar />

      {isMobile ? (
        // ── MOBILE ──
        <main style={{
          position:  "relative", zIndex: 1,
          maxWidth:  maxWidth,
          margin:    "0 auto",
          padding:   `calc(${theme.navbar.height} + 16px) 14px calc(${theme.bottomNav.height} + 20px)`,
        }}>
          {children}
        </main>
      ) : (
        // ── DESKTOP ──
        <div style={{
          position:   "relative", zIndex: 1,
          maxWidth:   1100,
          margin:     "0 auto",
          padding:    `calc(${theme.navbar.height} + 20px) 20px 40px`,
          display:    "flex",
          gap:        24,
          alignItems: "flex-start",
        }}>
          <DesktopSidebar />
          <main style={{ flex: 1, maxWidth: maxWidth, minWidth: 0 }}>
            {children}
          </main>
        </div>
      )}

      {isMobile && <BottomNav />}
    </div>
  )
}