// src/pages/LostFound.jsx
import { useEffect, useRef, useState } from "react"
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

async function uploadPhoto(file, userId) {
  const ext  = file.name.split(".").pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("lost-found").upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from("lost-found").getPublicUrl(path).data.publicUrl
}

const CATEGORIES = [
  { value:"all",       label:"All",        icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
  { value:"id_card",   label:"ID Card",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { value:"phone",     label:"Phone",      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
  { value:"laptop",    label:"Laptop",     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg> },
  { value:"wallet",    label:"Wallet",     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg> },
  { value:"keys",      label:"Keys",       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="4"/><path d="M10.5 10.5L20 20"/><path d="M17 17l2 2"/><path d="M15 19l2 2"/></svg> },
  { value:"bag",       label:"Bag",        icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { value:"earphones", label:"Earphones",  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> },
  { value:"other",     label:"Other",      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function LostFound() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState("all")      // all | lost | found
  const [category, setCategory]     = useState("all")
  const [search, setSearch]         = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => { fetchItems() }, [tab, category])

  function handleSearch(val) {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchItems(val), 400)
  }

  async function fetchItems(q = search) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab      !== "all") params.set("type",     tab)
      if (category !== "all") params.set("category", category)
      if (q.trim())           params.set("q",        q.trim())
      const res  = await fetch(`${BASE}/lostfound?${params}`, { headers: await authHeaders() })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
    setLoading(false)
  }

  async function handleResolve(id) {
    await fetch(`${BASE}/lostfound/${id}/resolve`, { method:"PATCH", headers: await authHeaders() })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this post?")) return
    await fetch(`${BASE}/lostfound/${id}`, { method:"DELETE", headers: await authHeaders() })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <PageLayout maxWidth={680}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:c.textPrimary, letterSpacing:"-0.3px" }}>Lost & Found</h2>
          <p style={{ fontSize:13, color:c.textMuted, marginTop:2 }}>Lost something? Found something? Post here.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:12, padding:"9px 16px", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:theme.shadow.btn }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post
        </button>
      </div>

      {/* Lost / Found tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[["all","All"],["lost","Lost"],["found","Found"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding:"8px 20px", borderRadius:24, fontSize:13, cursor:"pointer",
            background: tab===v ? (v==="lost" ? "linear-gradient(135deg,#ef4444,#f97316)" : v==="found" ? "linear-gradient(135deg,#10b981,#3b82f6)" : `linear-gradient(135deg,${c.gradientA},${c.gradientB})`) : "var(--bg-card)",
            border:`1px solid ${tab===v ? "transparent" : "rgba(200,200,220,0.40)"}`,
            color: tab===v ? "#fff" : c.textSecondary,
            fontWeight: tab===v ? 700 : 400,
            boxShadow: tab===v ? theme.shadow.btn : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:14 }}>
        <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:c.textMuted, pointerEvents:"none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search lost/found items..."
          style={{ width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"10px 14px 10px 36px", fontSize:13, color:c.textPrimary, outline:"none", boxSizing:"border-box" }}
          onFocus={e => e.target.style.borderColor = c.primary}
          onBlur={e => e.target.style.borderColor = "rgba(200,200,220,0.40)"}
        />
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", marginBottom:18, paddingBottom:4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer", flexShrink:0,
            background: category===cat.value ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "var(--bg-card)",
            border:`1px solid ${category===cat.value ? "transparent" : "rgba(200,200,220,0.40)"}`,
            color: category===cat.value ? "#fff" : c.textSecondary,
            fontWeight: category===cat.value ? 700 : 400,
          }}>
            <span style={{ color: category===cat.value ? "#fff" : c.textMuted }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height:140, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"rgba(99,102,241,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <p style={{ fontWeight:700, color:c.textPrimary, marginBottom:6 }}>Nothing here yet</p>
          <p style={{ fontSize:13, color:c.textMuted, marginBottom:16 }}>Lost something or found something? Post it!</p>
          <button onClick={() => setShowCreate(true)} style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:12, padding:"10px 24px", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:theme.shadow.btn }}>
            Post Now
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {items.map(item => (
            <LostFoundCard key={item.id} item={item} user={user} onResolve={handleResolve} onDelete={handleDelete} navigate={navigate} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          user={user}
          onClose={() => setShowCreate(false)}
          onSuccess={item => { setItems(prev => [item, ...prev]); setShowCreate(false) }}
        />
      )}
    </PageLayout>
  )
}

// ── Card ───────────────────────────────────────
function LostFoundCard({ item, user, onResolve, onDelete, navigate }) {
  const isOwner  = item.user_id === user?.id
  const isLost   = item.type === "lost"
  const cat      = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[CATEGORIES.length-1]

  return (
    <div style={{ background:"var(--bg-card)", border:`1px solid ${isLost ? "rgba(239,68,68,0.20)" : "rgba(16,185,129,0.20)"}`, borderRadius:16, overflow:"hidden" }}>
      {/* Type stripe */}
      <div style={{ height:4, background: isLost ? "linear-gradient(135deg,#ef4444,#f97316)" : "linear-gradient(135deg,#10b981,#3b82f6)" }} />

      <div style={{ padding:"14px 16px", display:"flex", gap:14 }}>
        {/* Photo */}
        {item.photo_url && (
          <div style={{ width:86, height:86, borderRadius:12, overflow:"hidden", flexShrink:0 }}>
            <img src={item.photo_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" alt="" />
          </div>
        )}

        <div style={{ flex:1, minWidth:0 }}>
          {/* Badges */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:8,
              background: isLost ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
              color:      isLost ? "#dc2626"              : "#059669",
            }}>
              {isLost ? "LOST" : "FOUND"}
            </span>
            <span style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:8, background:"rgba(99,102,241,0.07)", color:c.textSecondary, display:"flex", alignItems:"center", gap:4 }}>
              {cat.icon}{cat.label}
            </span>
          </div>

          <h3 style={{ fontSize:14, fontWeight:700, color:c.textPrimary, marginBottom:4, lineHeight:1.3 }}>{item.title}</h3>

          {item.description && <p style={{ fontSize:12, color:c.textSecondary, lineHeight:1.5, marginBottom:6 }}>{item.description}</p>}

          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {item.location && (
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:c.textMuted }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {item.location}
              </span>
            )}
            {item.date_occurred && (
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:c.textMuted }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {new Date(item.date_occurred).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
              </span>
            )}
            <span style={{ fontSize:11, color:c.textMuted }}>{timeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
        {/* Posted by */}
        <div onClick={() => navigate(item.user_id === user?.id ? "/profile" : `/user/${item.user_id}`)}
          style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, padding:1.5, flexShrink:0, cursor:"pointer" }}>
          <div style={{ width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden", border:"1px solid #fff", background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:c.primary }}>
            {item.users?.avatar_url ? <img src={item.users.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : item.users?.full_name?.charAt(0)}
          </div>
        </div>
        <span style={{ fontSize:12, color:c.textSecondary, fontWeight:500, flex:1 }}>{item.users?.full_name}</span>

        <div style={{ display:"flex", gap:7 }}>
          {/* Contact via WhatsApp */}
          {item.contact && !isOwner && (
            <a href={`https://wa.me/91${item.contact.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(37,211,102,0.10)", border:"1px solid rgba(37,211,102,0.25)", color:"#16a34a", borderRadius:9, padding:"6px 11px", fontSize:11, fontWeight:700, textDecoration:"none" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              WhatsApp
            </a>
          )}

          {/* DM */}
          {!isOwner && (
            <button onClick={() => navigate("/messages", { state: { openChat: item.users } })}
              style={{ display:"flex", alignItems:"center", gap:5, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:9, padding:"6px 11px", fontSize:11, fontWeight:700, cursor:"pointer", boxShadow:theme.shadow.btn }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              DM
            </button>
          )}

          {/* Owner actions */}
          {isOwner && (
            <>
              <button onClick={() => onResolve(item.id)}
                style={{ background:"rgba(16,185,129,0.10)", border:"1px solid rgba(16,185,129,0.25)", color:"#059669", borderRadius:9, padding:"6px 11px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                Resolved
              </button>
              <button onClick={() => onDelete(item.id)}
                style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:"#ef4444", borderRadius:9, padding:"6px 11px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Create Modal ───────────────────────────────
function CreateModal({ user, onClose, onSuccess }) {
  const [type,         setType]        = useState("lost")
  const [title,        setTitle]       = useState("")
  const [description,  setDesc]        = useState("")
  const [category,     setCategory]    = useState("other")
  const [location,     setLocation]    = useState("")
  const [dateOccurred, setDate]        = useState("")
  const [contact,      setContact]     = useState("")
  const [file,         setFile]        = useState(null)
  const [preview,      setPreview]     = useState(null)
  const [uploading,    setUploading]   = useState(false)
  const [error,        setError]       = useState("")

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError("Max 5MB"); return }
    setFile(f); setPreview(URL.createObjectURL(f)); setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError("Title is required.")
    setUploading(true); setError("")
    try {
      let photo_url = null
      if (file) photo_url = await uploadPhoto(file, user.id)

      const res = await fetch(`${BASE}/lostfound`, {
        method:"POST", headers: await authHeaders(),
        body: JSON.stringify({ type, title:title.trim(), description:description.trim()||null, category, location:location.trim()||null, date_occurred:dateOccurred||null, contact:contact.trim()||null, photo_url })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess(data)
    } catch (err) { setError(err.message || "Failed.") }
    finally { setUploading(false) }
  }

  const inp = { width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", fontSize:13, color:c.textPrimary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"var(--bg-overlay)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:500, background:"var(--bg-elevated)", borderRadius:"20px 20px 0 0", padding:"20px 18px 32px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>

        <div style={{ width:36, height:4, borderRadius:2, background:"#e5e7eb", margin:"0 auto 18px" }} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <h3 style={{ fontSize:17, fontWeight:700, color:"var(--text-primary)" }}>Post Lost / Found</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lost / Found toggle */}
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {[["lost","I Lost Something"],["found","I Found Something"]].map(([v,l]) => (
              <button key={v} type="button" onClick={() => setType(v)} style={{ flex:1, padding:"11px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
                background: type===v ? (v==="lost" ? "linear-gradient(135deg,#ef4444,#f97316)" : "linear-gradient(135deg,#10b981,#3b82f6)") : "rgba(99,102,241,0.06)",
                color: type===v ? "#fff" : c.textSecondary,
                boxShadow: type===v ? "0 4px 14px rgba(99,102,241,0.25)" : "none",
              }}>{l}</button>
            ))}
          </div>

          {/* Category */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", display:"block", marginBottom:8 }}>Category</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)} style={{
                  display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer",
                  background: category===cat.value ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "var(--bg-card)",
                  border:`1px solid ${category===cat.value ? "transparent" : "rgba(200,200,220,0.40)"}`,
                  color: category===cat.value ? "#fff" : c.textSecondary,
                  fontWeight: category===cat.value ? 700 : 400,
                }}>
                  <span style={{ color: category===cat.value ? "#fff" : c.textMuted }}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom:12 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={`What did you ${type}? *`} style={{ ...inp, fontWeight:600, fontSize:14 }} />
          </div>

          {/* Description */}
          <div style={{ marginBottom:12 }}>
            <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Describe it — color, brand, any special marks..."
              style={{ ...inp, resize:"none", height:72 }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Where? (Block, canteen...)" style={inp} />
            <input type="date" value={dateOccurred} onChange={e => setDate(e.target.value)} style={inp} />
          </div>

          <div style={{ marginBottom:14 }}>
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="WhatsApp number (optional)" style={inp} />
          </div>

          {/* Photo */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", display:"block", marginBottom:8 }}>Photo <span style={{ fontWeight:400, color:"var(--text-muted)" }}>(optional)</span></label>
            {preview ? (
              <div style={{ position:"relative", height:140, borderRadius:10, overflow:"hidden" }}>
                <img src={preview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                <button type="button" onClick={() => { setFile(null); setPreview(null) }}
                  style={{ position:"absolute", top:8, right:8, background:"var(--bg-overlay)", border:"none", borderRadius:"50%", width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ) : (
              <label style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 14px", background:"rgba(99,102,241,0.04)", border:"1.5px dashed rgba(99,102,241,0.25)", borderRadius:10, cursor:"pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span style={{ fontSize:13, color:c.primary, fontWeight:600 }}>Add a photo</span>
                <input type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
              </label>
            )}
          </div>

          {error && <p style={{ fontSize:12, color:"#ef4444", marginBottom:12, fontWeight:500 }}>{error}</p>}

          <button type="submit" disabled={uploading} style={{ width:"100%", background: type==="lost" ? "linear-gradient(135deg,#ef4444,#f97316)" : "linear-gradient(135deg,#10b981,#3b82f6)", color:"#fff", border:"none", borderRadius:14, padding:"14px", fontWeight:700, fontSize:14, cursor:"pointer", opacity:uploading?0.7:1 }}>
            {uploading ? "Posting..." : type==="lost" ? "Post Lost Item" : "Post Found Item"}
          </button>
        </form>
      </div>
    </div>
  )
}