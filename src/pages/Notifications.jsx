// src/pages/Notifications.jsx
import { useEffect, useState } from "react"
import PageLayout from "../components/PageLayout"
import { getNotifications } from "../lib/api"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors


const TYPE = {
  like:    { label: "liked your post",       color: "#e11d48" },
  comment: { label: "commented on your post", color: "#6366f1" },
  follow:  { label: "started following you",  color: "#10b981" },
  event:   { label: "new event posted",       color: "#f59e0b" },
}

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff/60)}m`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  return `${Math.floor(diff/86400)}d`
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifs()
    const ch = supabase.channel("notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        p => setNotifs(prev => [p.new, ...prev]))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function fetchNotifs() {
    setLoading(true)
    const data = await getNotifications()
    setNotifs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function markAllRead() {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <PageLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px" }}>
          Notifications {unread > 0 && <span style={{ fontSize: 13, background: c.primaryLight, color: c.primary, padding: "2px 8px", borderRadius: theme.radius.full, fontWeight: 600 }}>{unread}</span>}
        </h2>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: "none", border: "none", color: c.primary, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Mark all read</button>
        )}
      </div>

      {loading ? (
        [1,2,3].map(i => (
          <div key={i} style={{ background: c.bgGlass, backdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.lg, padding: 14, display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.primaryLight }} />
            <div style={{ flex: 1 }}><div style={{ width: 160, height: 12, background: c.primaryLight, borderRadius: 6 }} /></div>
          </div>
        ))
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: c.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <p style={{ fontWeight: 600, color: c.textPrimary, marginBottom: 4 }}>No notifications yet</p>
          <p style={{ fontSize: 13, color: c.textMuted }}>When someone likes or follows you, it'll show here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map(n => {
            const type = TYPE[n.type] || { label: "new activity", color: c.primary }
            return (
              <div key={n.id} style={{
                background:     n.read ? c.bgGlass : c.bgGlassStrong,
                backdropFilter: theme.blur, WebkitBackdropFilter: theme.blur,
                border:         `1px solid ${n.read ? c.border : c.borderAccent}`,
                borderRadius:   theme.radius.lg,
                padding:        "12px 14px",
                display:        "flex", alignItems: "center", gap: 12,
                transition:     "all 0.2s",
              }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {n.actor?.avatar_url ? <img src={n.actor.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : n.actor?.full_name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: c.textPrimary }}>
                    <span style={{ fontWeight: 700 }}>{n.actor?.full_name || "Someone"}</span>
                    {" "}<span style={{ color: c.textSecondary }}>{type.label}</span>
                  </p>
                  <p style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{timeAgo(n.created_at)} ago</p>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.primary, flexShrink: 0 }} />}
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}