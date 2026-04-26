// src/pages/Events.jsx
import { useEffect, useRef, useState } from "react"
import PageLayout from "../components/PageLayout"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

const TYPE_COLORS = {
  hackathon: { bg: "rgba(99,102,241,0.08)",  color: "#6366f1", border: "rgba(99,102,241,0.20)" },
  workshop:  { bg: "rgba(16,185,129,0.08)",  color: "#059669", border: "rgba(16,185,129,0.20)" },
  fest:      { bg: "rgba(236,72,153,0.08)",  color: "#db2777", border: "rgba(236,72,153,0.20)" },
  other:     { bg: "rgba(107,114,128,0.08)", color: "var(--text-secondary)", border: "rgba(107,114,128,0.20)" },
}

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", {
  day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit"
}) : "TBA"

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState("all")
  const [registering, setRegistering] = useState(null)
  const [showCreate, setShowCreate]   = useState(false)

  useEffect(() => { fetchEvents() }, [filter])

  async function fetchEvents() {
    setLoading(true)
    try {
      const url  = filter === "all" ? `${BASE}/events` : `${BASE}/events?type=${filter}`
      const res  = await fetch(url, { headers: await authHeaders() })
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch { setEvents([]) }
    finally { setLoading(false) }
  }

  async function toggleRegister(eventId) {
    setRegistering(eventId)
    try {
      const res  = await fetch(`${BASE}/events/${eventId}/register`, { method: "POST", headers: await authHeaders() })
      const data = await res.json()
      setEvents(prev => prev.map(e => e.id === eventId
        ? { ...e, is_registered: data.registered }
        : e
      ))
    } catch {}
    setRegistering(null)
  }

  async function deleteEvent(eventId) {
    if (!window.confirm("Delete this event?")) return
    await fetch(`${BASE}/events/${eventId}`, { method: "DELETE", headers: await authHeaders() })
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  return (
    <PageLayout maxWidth={680}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px" }}>Campus Events</h2>
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
          color: "#fff", border: "none", borderRadius: 12,
          padding: "9px 16px", fontWeight: 700, fontSize: 13,
          cursor: "pointer", boxShadow: theme.shadow.btn,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Host Event
        </button>
      </div>
      <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 20 }}>Hackathons, workshops and more</p>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","hackathon","workshop","fest","other"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 24,
            background: filter === f ? `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})` : "var(--bg-card)",
            backdropFilter: "none",
            border: `1px solid ${filter === f ? "transparent" : "var(--bg-card)"}`,
            color: filter === f ? "#fff" : c.textSecondary,
            fontWeight: filter === f ? 700 : 400, fontSize: 13,
            cursor: "pointer", transition: "opacity 0.15s", textTransform: "capitalize",
            boxShadow: filter === f ? theme.shadow.btn : "none",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <div style={{ width: 160, height: 14, background: "rgba(99,102,241,0.08)", borderRadius: 6, marginBottom: 10 }} />
              <div style={{ width: "100%", height: 10, background: "rgba(99,102,241,0.08)", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 20 }}>
          <p style={{ fontWeight: 700, color: c.textPrimary, marginBottom: 4 }}>No events yet</p>
          <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 16 }}>Be the first to host one!</p>
          <button onClick={() => setShowCreate(true)} style={{ background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: theme.shadow.btn }}>
            Host an Event
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map(event => {
            const ts      = TYPE_COLORS[event.event_type] || TYPE_COLORS.other
            const isOwner = event.created_by === user?.id
            return (
              <div key={event.id} style={{ background: "var(--bg-card)", backdropFilter: "none", WebkitBackdropFilter: "none", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", transition: "opacity 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = theme.shadow.hover }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
              >
                {event.banner_url && (
                  <div style={{ height: 140, overflow: "hidden" }}>
                    <img src={event.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  </div>
                )}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 24, background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color, fontSize: 11, fontWeight: 700, textTransform: "capitalize", marginBottom: 6 }}>
                        {event.event_type}
                      </span>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: c.textPrimary, lineHeight: 1.3 }}>{event.title}</h3>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                      {isOwner && (
                        <button onClick={() => deleteEvent(event.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 10, padding: "6px 10px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                          Delete
                        </button>
                      )}
                      <button onClick={() => toggleRegister(event.id)} disabled={registering === event.id} style={{
                        padding: "8px 16px", borderRadius: 12,
                        background: event.is_registered ? "rgba(16,185,129,0.08)" : `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
                        border: event.is_registered ? "1px solid rgba(16,185,129,0.20)" : "none",
                        color: event.is_registered ? "#059669" : "#fff",
                        fontWeight: 700, fontSize: 12, cursor: "pointer",
                        boxShadow: event.is_registered ? "none" : theme.shadow.btn,
                        opacity: registering === event.id ? 0.6 : 1,
                      }}>
                        {registering === event.id ? "..." : event.is_registered ? "Registered ✓" : "Register"}
                      </button>
                    </div>
                  </div>

                  {event.description && (
                    <p style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{event.description}</p>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {event.starts_at && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.textMuted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {fmt(event.starts_at)}
                      </span>
                    )}
                    {event.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.textMuted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.location}
                      </span>
                    )}
                    {event.prize_pool && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.textMuted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Prize: {event.prize_pool}
                      </span>
                    )}
                    {event.max_team_size && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.textMuted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Team: up to {event.max_team_size}
                      </span>
                    )}
                  </div>

                  {event.users && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(99,102,241,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                        {event.users.avatar_url
                          ? <img src={event.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                          : event.users.full_name?.charAt(0)
                        }
                      </div>
                      <span style={{ fontSize: 11, color: c.textMuted }}>
                        Hosted by <strong style={{ color: c.textSecondary }}>{event.users.full_name}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onSuccess={event => { setEvents(prev => [event, ...prev]); setShowCreate(false) }}
        />
      )}
    </PageLayout>
  )
}

// ── Create Event Modal — each field has its own state to prevent cursor loss ──
function CreateEventModal({ onClose, onSuccess }) {
  const [title, setTitle]           = useState("")
  const [eventType, setEventType]   = useState("hackathon")
  const [description, setDesc]      = useState("")
  const [startsAt, setStartsAt]     = useState("")
  const [endsAt, setEndsAt]         = useState("")
  const [location, setLocation]     = useState("")
  const [prizePool, setPrizePool]   = useState("")
  const [maxTeam, setMaxTeam]       = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError("Title is required.")
    setLoading(true); setError("")
    try {
      const res = await fetch(`${BASE}/events`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          title:         title.trim(),
          event_type:    eventType,
          description:   description.trim() || null,
          starts_at:     startsAt || null,
          ends_at:       endsAt   || null,
          location:      location.trim()  || null,
          prize_pool:    prizePool.trim() || null,
          max_team_size: maxTeam ? parseInt(maxTeam) : null,
        }),
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess(data)
    } catch (err) { setError(err.message || "Something went wrong.") }
    finally { setLoading(false) }
  }

  const inputSt = {
    width: "100%", background: "var(--bg-nav)",
    border: "1px solid var(--border)", borderRadius: 12,
    padding: "10px 14px", fontSize: 14, color: "var(--text-primary)",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "var(--bg-elevated)", borderRadius: 24, padding: "24px 22px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Host an Event</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Makeathon 8.0"
              style={inputSt}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Event Type *</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="fest">Fest</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="What is this event about?"
              style={{ ...inputSt, resize: "none", height: 90 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Start Date & Time</label>
              <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} style={inputSt} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>End Date & Time</label>
              <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} style={inputSt} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. LPU Auditorium, Block 32"
              style={inputSt}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Prize Pool</label>
              <input
                type="text"
                value={prizePool}
                onChange={e => setPrizePool(e.target.value)}
                placeholder="e.g. ₹50,000"
                style={inputSt}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Max Team Size</label>
              <input
                type="number"
                value={maxTeam}
                onChange={e => setMaxTeam(e.target.value)}
                placeholder="e.g. 4"
                style={inputSt}
                min="1" max="20"
              />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 14, fontWeight: 500, background: "rgba(239,68,68,0.06)", padding: "8px 12px", borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%",
            background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
            color: "#fff", border: "none", borderRadius: 14,
            padding: "14px", fontWeight: 700, fontSize: 15,
            cursor: "pointer", boxShadow: theme.shadow.btn,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  )
}