// src/pages/Communities.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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

const ICONS = {
  "lpu-coders":       "💻",
  "campus-life":      "🏫",
  "hackathons":       "⚡",
  "study-groups":     "📚",
  "startups-ideas":   "🚀",
  "sports-fitness":   "🏋️",
}

export default function Communities() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [joining, setJoining]         = useState(null)

  useEffect(() => { fetchCommunities() }, [])

  async function fetchCommunities() {
    setLoading(true)
    try {
      const res  = await fetch(`${BASE}/communities`, { headers: await authHeaders() })
      const data = await res.json()
      setCommunities(Array.isArray(data) ? data : [])
    } catch { setCommunities([]) }
    finally { setLoading(false) }
  }

  async function toggleJoin(communityId) {
    setJoining(communityId)
    try {
      const res  = await fetch(`${BASE}/communities/${communityId}/join`, { method: "POST", headers: await authHeaders() })
      const data = await res.json()
      setCommunities(prev => prev.map(c =>
        c.id === communityId
          ? { ...c, is_member: data.joined, members_count: data.joined ? c.members_count + 1 : Math.max(0, c.members_count - 1) }
          : c
      ))
    } catch {}
    setJoining(null)
  }

  const joined = communities.filter(c => c.is_member)
  const explore = communities.filter(c => !c.is_member)

  return (
    <PageLayout maxWidth={680}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px" }}>Communities</h2>
          <p style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>Find your tribe at LPU</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
          color: "#fff", border: "none", borderRadius: 12,
          padding: "9px 16px", fontWeight: 700, fontSize: 13,
          cursor: "pointer", boxShadow: theme.shadow.btn,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 80, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Joined communities */}
          {joined.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Your Communities</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {joined.map(com => (
                  <CommunityCard key={com.id} community={com} onJoin={toggleJoin} joining={joining} onOpen={() => navigate(`/community/${com.slug}`)} icons={ICONS} />
                ))}
              </div>
            </div>
          )}

          {/* Explore */}
          {explore.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                {joined.length > 0 ? "Discover More" : "All Communities"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {explore.map(com => (
                  <CommunityCard key={com.id} community={com} onJoin={toggleJoin} joining={joining} onOpen={() => navigate(`/community/${com.slug}`)} icons={ICONS} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateCommunityModal
          onClose={() => setShowCreate(false)}
          onSuccess={com => { setCommunities(prev => [com, ...prev]); setShowCreate(false) }}
        />
      )}
    </PageLayout>
  )
}

function CommunityCard({ community, onJoin, joining, onOpen, icons }) {
  const icon = icons[community.slug] || "🌐"
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
      onClick={onOpen}>

      {/* Icon */}
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${theme.colors.gradientA}22, ${theme.colors.gradientB}22)`, border: `1px solid ${theme.colors.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {community.icon_url
          ? <img src={community.icon_url} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} alt="" />
          : icon
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: theme.colors.textPrimary }}>c/{community.name}</p>
        {community.description && (
          <p style={{ fontSize: 12, color: theme.colors.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{community.description}</p>
        )}
        <p style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>
          {community.members_count?.toLocaleString() || 0} members · {community.posts_count || 0} posts
        </p>
      </div>

      {/* Join button */}
      <button
        onClick={e => { e.stopPropagation(); onJoin(community.id) }}
        disabled={joining === community.id}
        style={{
          flexShrink: 0,
          padding: "7px 14px", borderRadius: 24,
          background: community.is_member ? "var(--bg-card)" : `linear-gradient(135deg, ${theme.colors.gradientA}, ${theme.colors.gradientB})`,
          border: community.is_member ? "1px solid var(--border)" : "none",
          color: community.is_member ? theme.colors.textSecondary : "#fff",
          fontWeight: 600, fontSize: 12, cursor: "pointer",
          boxShadow: community.is_member ? "none" : theme.shadow.btn,
          opacity: joining === community.id ? 0.6 : 1,
        }}>
        {joining === community.id ? "..." : community.is_member ? "Joined" : "Join"}
      </button>
    </div>
  )
}

function CreateCommunityModal({ onClose, onSuccess }) {
  const [name, setName]         = useState("")
  const [desc, setDesc]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError("Name is required.")
    if (name.trim().length < 3) return setError("Name must be at least 3 characters.")
    setLoading(true); setError("")
    try {
      const res  = await fetch(`${BASE}/communities`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || null })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess(data)
    } catch (err) { setError(err.message || "Something went wrong.") }
    finally { setLoading(false) }
  }

  
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--bg-elevated)", borderRadius: 24, padding: "24px 20px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Create Community</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Community Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. LPU Coders"
              style={{ width: "100%", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = c.primary}
              onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.15)"}
            />
            {slug && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>c/{slug}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Description <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span></label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this community about?"
              style={{ width: "100%", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none", resize: "none", height: 80, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, fontWeight: 500 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ width: "100%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  )
}