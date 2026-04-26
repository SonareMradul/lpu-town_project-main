// src/pages/Messages.jsx
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import DesktopSidebar from "../components/DesktopSidebar"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth.jsx"
import useIsMobile from "../hooks/useIsMobile"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

export default function Messages() {
  const { user }   = useAuth()
  const location   = useLocation()
  const isMobile   = useIsMobile()

  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat]       = useState(null)
  const [messages, setMessages]           = useState([])
  const [newMsg, setNewMsg]               = useState("")
  const [loading, setLoading]             = useState(true)
  const [mobileView, setMobileView]       = useState("list") // "list" | "chat"
  const bottomRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (location.state?.openChat) {
      setActiveChat(location.state.openChat)
      setMobileView("chat")
    }
  }, [location.state])

  useEffect(() => {
    if (!activeChat) return
    fetchMessages(activeChat.partner_id)
    const ch = supabase.channel(`chat-${activeChat.partner_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        p => { if (p.new.sender_id === activeChat.partner_id) setMessages(prev => [...prev, p.new]) })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [activeChat])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function fetchConversations() {
    try {
      const res  = await fetch(`${BASE}/messages/conversations`, { headers: await authHeaders() })
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch { setConversations([]) }
    finally { setLoading(false) }
  }

  async function fetchMessages(partnerId) {
    try {
      const res  = await fetch(`${BASE}/messages/${partnerId}`, { headers: await authHeaders() })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch { setMessages([]) }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeChat) return
    const content = newMsg.trim()
    setMessages(prev => [...prev, { id: Date.now(), sender_id: user.id, content, created_at: new Date().toISOString() }])
    setNewMsg("")
    await fetch(`${BASE}/messages/${activeChat.partner_id}`, { method: "POST", headers: await authHeaders(), body: JSON.stringify({ content }) })
    fetchConversations()
  }

  const fmt = d => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const glass = { background: "var(--bg-card)", backdropFilter: "none", WebkitBackdropFilter: "none", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }

  const ConvList = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(99,102,241,0.08)", flexShrink: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: c.textPrimary }}>Messages</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 14 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "rgba(99,102,241,0.06)", borderRadius: 10, marginBottom: 8 }} />)}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: c.textMuted, fontWeight: 600 }}>No conversations yet</p>
          </div>
        ) : conversations.map(conv => (
          <div key={conv.partner_id} onClick={() => { setActiveChat(conv); setMobileView("chat") }} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            cursor: "pointer", transition: "background 0.15s",
            background: activeChat?.partner_id === conv.partner_id ? "rgba(99,102,241,0.08)" : "transparent",
            borderLeft: `3px solid ${activeChat?.partner_id === conv.partner_id ? c.primary : "transparent"}`,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 1.5, flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c.primary }}>
                {conv.avatar_url ? <img src={conv.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : conv.full_name?.charAt(0)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: c.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.full_name}</p>
              <p style={{ fontSize: 11, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.last_message}</p>
            </div>
            {conv.unread_count > 0 && (
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{conv.unread_count}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const ChatWindow = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {!activeChat ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p style={{ fontWeight: 600, color: c.textPrimary }}>Select a conversation</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(99,102,241,0.08)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {isMobile && (
              <button onClick={() => setMobileView("list")} style={{ background: "none", border: "none", cursor: "pointer", color: c.primary, padding: "0 8px 0 0", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 1.5, flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.primary }}>
                {activeChat.avatar_url ? <img src={activeChat.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : activeChat.full_name?.charAt(0)}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: c.textPrimary }}>{activeChat.full_name}</p>
              <p style={{ fontSize: 11, color: c.textMuted }}>@{activeChat.username}</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.length === 0 && <p style={{ textAlign: "center", color: c.textMuted, fontSize: 13, padding: "20px 0" }}>Say hi!</p>}
            {messages.map(msg => {
              const isMe = msg.sender_id === user.id
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "75%", padding: "9px 13px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})` : "var(--bg-card)", border: isMe ? "none" : "1px solid rgba(99,102,241,0.10)" }}>
                    <p style={{ fontSize: 13, color: isMe ? "#fff" : c.textPrimary, lineHeight: 1.4 }}>{msg.content}</p>
                    <p style={{ fontSize: 9, color: isMe ? "rgba(255,255,255,0.6)" : c.textMuted, marginTop: 3, textAlign: "right" }}>{fmt(msg.created_at)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} style={{ padding: "10px 14px", borderTop: "1px solid rgba(99,102,241,0.08)", display: "flex", gap: 10, flexShrink: 0 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={`Message ${activeChat.full_name}...`}
              style={{ flex: 1, background: "var(--bg-nav)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 24, padding: "10px 16px", fontSize: 13, color: c.textPrimary, outline: "none" }}
              onFocus={e => e.target.style.borderColor = c.primary}
              onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.15)"}
            />
            <button type="submit" disabled={!newMsg.trim()} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: theme.shadow.btn, opacity: !newMsg.trim() ? 0.4 : 1, flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </>
      )}
    </div>
  )

  const navH   = theme.navbar.height
  const botH   = theme.bottomNav.height
  const chatH  = isMobile
    ? `calc(100vh - ${navH} - ${botH} - 24px)`
    : `calc(100vh - ${navH} - 60px)`

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {isMobile ? (
        // ── MOBILE ──
        <div style={{ position: "relative", zIndex: 1, padding: `calc(${navH} + 12px) 12px calc(${botH} + 12px)` }}>
          <div style={{ ...glass, height: chatH, overflow: "hidden" }}>
            {mobileView === "list" ? ConvList : ChatWindow}
          </div>
        </div>
      ) : (
        // ── DESKTOP ──
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: `calc(${navH} + 20px) 20px 20px`, display: "flex", gap: 24, alignItems: "flex-start", height: "100vh" }}>
            <DesktopSidebar />
            <div style={{ flex: 1, display: "flex", gap: 12, height: chatH, minWidth: 0 }}>
              <div style={{ width: 280, flexShrink: 0, ...glass }}>{ConvList}</div>
              <div style={{ flex: 1, minWidth: 0, ...glass }}>{ChatWindow}</div>
            </div>
          </div>
        </div>
      )}

      {isMobile && <BottomNav />}
    </div>
  )
}