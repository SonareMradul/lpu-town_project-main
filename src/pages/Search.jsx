// src/pages/Search.jsx
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import PageLayout from "../components/PageLayout"
import { supabase } from "../lib/supabase"
import theme from "../theme"

const c = theme.colors
const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

const TABS = ["all", "users", "posts", "reels", "events"]

export default function Search() {
  const navigate    = useNavigate()
  const debounceRef = useRef(null)

  const [query,    setQuery]    = useState("")
  const [tab,      setTab]      = useState("all")
  const [results,  setResults]  = useState({ users:[], posts:[], reels:[], events:[] })
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  function handleInput(val) {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setSearched(false); setResults({ users:[], posts:[], reels:[], events:[] }); return }
    debounceRef.current = setTimeout(() => doSearch(val, tab), 400)
  }

  async function doSearch(q = query, t = tab) {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res  = await fetch(`${BASE}/search?q=${encodeURIComponent(q.trim())}&type=${t}`, { headers: await authHeaders() })
      const data = await res.json()
      setResults({
        users:  Array.isArray(data.users)  ? data.users  : [],
        posts:  Array.isArray(data.posts)  ? data.posts  : [],
        reels:  Array.isArray(data.reels)  ? data.reels  : [],
        events: Array.isArray(data.events) ? data.events : [],
      })
    } catch { setResults({ users:[], posts:[], reels:[], events:[] }) }
    setLoading(false)
  }

  function handleTabChange(t) {
    setTab(t)
    if (query.trim()) doSearch(query, t)
  }

  const totalResults = results.users.length + results.posts.length + results.reels.length + results.events.length

  return (
    <PageLayout maxWidth={660}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 16, letterSpacing: "-0.3px" }}>Search</h2>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: c.textMuted, pointerEvents: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          placeholder="Search students, posts, reels, events..."
          style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px 12px 38px", fontSize: 14, color: c.textPrimary, outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.30)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => handleTabChange(t)} style={{
            padding: "7px 16px", borderRadius: 24, fontSize: 13, cursor: "pointer", flexShrink: 0,
            background: tab === t ? `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})` : "var(--bg-card)",
            border: `1px solid ${tab === t ? "transparent" : "var(--border)"}`,
            color: tab === t ? "#fff" : c.textSecondary,
            fontWeight: tab === t ? 700 : 400,
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: 140, height: 12, background: "rgba(99,102,241,0.08)", borderRadius: 6, marginBottom: 6 }} />
                <div style={{ width: 90, height: 10, background: "rgba(99,102,241,0.08)", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && totalResults === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <p style={{ fontWeight: 700, color: c.textPrimary, marginBottom: 4 }}>No results found</p>
          <p style={{ fontSize: 13, color: c.textMuted }}>Try a different keyword</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && totalResults > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Users */}
          {results.users.length > 0 && (tab === "all" || tab === "users") && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Students ({results.users.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.users.map(u => (
                  <div key={u.id} onClick={() => navigate(`/user/${u.id}`)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 2, flexShrink: 0 }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: c.primary }}>
                        {u.avatar_url ? <img src={u.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : u.full_name?.charAt(0)}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: c.textPrimary, marginBottom: 2 }}>{u.full_name}</p>
                      <p style={{ fontSize: 12, color: c.textMuted }}>@{u.username}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); navigate("/messages", { state: { openChat: u } }) }}
                      style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: c.primary, fontWeight: 600, fontSize: 12, padding: "6px 12px", borderRadius: 10, cursor: "pointer" }}>
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (tab === "all" || tab === "posts") && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Posts ({results.posts.length})</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {results.posts.map(p => (
                  <div key={p.id} style={{ aspectRatio: "1/1", borderRadius: 12, overflow: "hidden", background: "rgba(99,102,241,0.06)", cursor: "pointer", position: "relative" }}>
                    {p.image_url && <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" alt="" />}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                      <p style={{ fontSize: 10, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reels */}
          {results.reels.length > 0 && (tab === "all" || tab === "reels") && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Reels ({results.reels.length})</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {results.reels.map(r => (
                  <div key={r.id} style={{ aspectRatio: "9/16", borderRadius: 12, overflow: "hidden", background: "#111", cursor: "pointer", position: "relative" }}>
                    {r.thumbnail_url && <img src={r.thumbnail_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" alt="" />}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                      <p style={{ fontSize: 10, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.users?.full_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {results.events.length > 0 && (tab === "all" || tab === "events") && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Events ({results.events.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.events.map(ev => (
                  <div key={ev.id} onClick={() => navigate("/events")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(99,102,241,0.10)", color: c.primary, padding: "2px 8px", borderRadius: 6 }}>{ev.event_type}</span>
                        <p style={{ fontSize: 14, fontWeight: 700, color: c.textPrimary, marginTop: 6, marginBottom: 4 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: c.textMuted }}>{ev.location} · {new Date(ev.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore tags — before search */}
      {!searched && !loading && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Explore topics</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["hackathon", "workshop", "fest", "other", "Startups", "Projects", "Coding", "Design"].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); setSearched(true); doSearch(tag, tab) }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 24, padding: "8px 16px", fontSize: 13, color: c.textSecondary, cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.color = c.primary }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = c.textSecondary }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  )
}