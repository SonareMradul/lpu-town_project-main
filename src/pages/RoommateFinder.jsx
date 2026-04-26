// src/pages/RoommateFinder.jsx
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
  const { error } = await supabase.storage.from("pg-photos").upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from("pg-photos").getPublicUrl(path)
  return data.publicUrl
}

const AREAS = ["Phagwara", "Sector 7", "Sector 8", "GT Road", "Near LPU Gate", "Jalandhar Bypass", "Other"]

export default function RoommateFinder() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [listings, setListings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab]               = useState("all")
  const [filters, setFilters]       = useState({ gender_pref:"any", max_rent:"", location:"" })
  const [interesting, setInteresting] = useState(null)
  const [interestedModal, setInterestedModal] = useState(null)

  useEffect(() => { fetchListings() }, [tab, filters])

  async function fetchListings() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tab !== "all") params.set("type", tab)
      if (filters.gender_pref !== "any") params.set("gender_pref", filters.gender_pref)
      if (filters.max_rent) params.set("max_rent", filters.max_rent)
      if (filters.location) params.set("location", filters.location)
      const res  = await fetch(`${BASE}/roommates?${params}`, { headers: await authHeaders() })
      const data = await res.json()
      setListings(Array.isArray(data) ? data : [])
    } catch { setListings([]) }
    setLoading(false)
  }

  async function toggleInterest(listingId) {
    setInteresting(listingId)
    try {
      const res  = await fetch(`${BASE}/roommates/${listingId}/interest`, { method:"POST", headers: await authHeaders() })
      const data = await res.json()
      setListings(prev => prev.map(l => l.id === listingId
        ? { ...l, i_am_interested: data.interested, interest_count: data.interested ? l.interest_count+1 : Math.max(0,l.interest_count-1) }
        : l
      ))
    } catch {}
    setInteresting(null)
  }

  async function handleDelete(listingId) {
    if (!window.confirm("Delete this listing?")) return
    await fetch(`${BASE}/roommates/${listingId}`, { method:"DELETE", headers: await authHeaders() })
    setListings(prev => prev.filter(l => l.id !== listingId))
  }

  return (
    <PageLayout maxWidth={700}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:c.textPrimary, letterSpacing:"-0.3px" }}>PG & Flat Finder</h2>
          <p style={{ fontSize:13, color:c.textMuted, marginTop:2 }}>Off-campus rooms, PGs & flatmates near LPU</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:12, padding:"9px 16px", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:theme.shadow.btn }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[["all","All"],["offering","Room Available"],["looking","Looking for Room"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding:"7px 14px", borderRadius:24, fontSize:13, cursor:"pointer",
            background: tab===v ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "var(--bg-card)",
            border:`1px solid ${tab===v ? "transparent" : "rgba(200,200,220,0.40)"}`,
            color: tab===v ? "#fff" : c.textSecondary,
            fontWeight: tab===v ? 700 : 400,
            boxShadow: tab===v ? theme.shadow.btn : "none",
          }}>{l}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
        <select value={filters.gender_pref} onChange={e => setFilters(f => ({ ...f, gender_pref: e.target.value }))}
          style={{ padding:"8px 12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:12, color:c.textSecondary, outline:"none", cursor:"pointer" }}>
          <option value="any">Any Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={filters.max_rent} onChange={e => setFilters(f => ({ ...f, max_rent: e.target.value }))}
          style={{ padding:"8px 12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:12, color:c.textSecondary, outline:"none", cursor:"pointer" }}>
          <option value="">Any Rent</option>
          <option value="4000">Under ₹4,000</option>
          <option value="6000">Under ₹6,000</option>
          <option value="8000">Under ₹8,000</option>
          <option value="12000">Under ₹12,000</option>
        </select>
        <select value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          style={{ padding:"8px 12px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg-card)", fontSize:12, color:c.textSecondary, outline:"none", cursor:"pointer" }}>
          <option value="">All Areas</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Listings */}
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height:200, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16 }} />)}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16 }}>
          <p style={{ fontWeight:700, color:c.textPrimary, marginBottom:6 }}>No listings found</p>
          <p style={{ fontSize:13, color:c.textMuted, marginBottom:16 }}>Be the first to post!</p>
          <button onClick={() => setShowCreate(true)} style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:12, padding:"10px 24px", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:theme.shadow.btn }}>
            Post Listing
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {listings.map(l => (
            <ListingCard key={l.id} listing={l} user={user} onInterest={toggleInterest} interesting={interesting} onDelete={handleDelete} navigate={navigate} onViewInterested={(id, title) => setInterestedModal({ id, title })} />
          ))}
        </div>
      )}

      {interestedModal && (
        <InterestedModal
          listingId={interestedModal.id}
          title={interestedModal.title}
          onClose={() => setInterestedModal(null)}
          navigate={navigate}
        />
      )}

      {showCreate && (
        <CreateListingModal
          user={user}
          onClose={() => setShowCreate(false)}
          onSuccess={listing => { setListings(prev => [listing, ...prev]); setShowCreate(false) }}
        />
      )}
    </PageLayout>
  )
}

// ── Interested Modal ──────────────────────────
function InterestedModal({ listingId, title, onClose, navigate }) {
  const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetch_() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res  = await fetch(`${BASE}/roommates/${listingId}/interested`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        })
        const data = await res.json()
        setPeople(Array.isArray(data) ? data : [])
      } catch { setPeople([]) }
      setLoading(false)
    }
    fetch_()
  }, [listingId])

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:300, background:"var(--bg-overlay)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:480, background:"var(--bg-elevated)", borderRadius:"20px 20px 0 0", padding:"20px 18px 32px", maxHeight:"70vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:"#e5e7eb", margin:"0 auto 18px" }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>Interested People</h3>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{title}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Loading...</div>
        ) : people.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center" }}>
            <p style={{ fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>No one yet</p>
            <p style={{ fontSize:13, color:"var(--text-muted)" }}>Share your listing to get more interest</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {people.map(p => (
              <div key={p.user_id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"rgba(99,102,241,0.04)", borderRadius:12, border:"1px solid rgba(99,102,241,0.10)" }}>
                <div onClick={() => { navigate(`/user/${p.user_id}`); onClose() }}
                  style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, padding:2, flexShrink:0, cursor:"pointer" }}>
                  <div style={{ width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden", border:"1.5px solid #fff", background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:c.primary }}>
                    {p.users?.avatar_url ? <img src={p.users.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : p.users?.full_name?.charAt(0)}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)" }}>{p.users?.full_name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)" }}>@{p.users?.username}</p>
                </div>
                <button onClick={() => { navigate("/messages", { state: { openChat: p.users } }); onClose() }}
                  style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, boxShadow:theme.shadow.btn }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Listing Card ───────────────────────────────
function ListingCard({ listing: l, user, onInterest, interesting, onDelete, navigate }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos = [l.photo_1, l.photo_2, l.photo_3].filter(Boolean)
  const isOwner = l.user_id === user?.id
  const isOffering = l.type === "offering"

  const amenities = [
    l.wifi    && "WiFi",
    l.ac      && "AC",
    l.food    && "Food",
    l.parking && "Parking",
    l.laundry && "Laundry",
  ].filter(Boolean)

  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>

      {/* Photos */}
      {photos.length > 0 && (
        <div style={{ position:"relative", height:200, overflow:"hidden", background:"var(--bg-input)" }}>
          <img src={photos[photoIdx]} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" loading="lazy" />
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", background:"var(--bg-overlay)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"var(--bg-overlay)", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              {/* Dots */}
              <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
                {photos.map((_, i) => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background: i===photoIdx ? "#fff" : "rgba(255,255,255,0.5)" }} />)}
              </div>
            </>
          )}
          {/* Type badge */}
          <div style={{ position:"absolute", top:10, left:10, background: isOffering ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "linear-gradient(135deg,#10b981,#3b82f6)", borderRadius:8, padding:"4px 10px" }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{isOffering ? "Room Available" : "Looking"}</span>
          </div>
        </div>
      )}

      {/* No photo — just type badge */}
      {photos.length === 0 && (
        <div style={{ height:60, background:`linear-gradient(135deg,${isOffering ? c.gradientA+"22" : "#10b98122"},${isOffering ? c.gradientB+"22" : "#3b82f622"})`, display:"flex", alignItems:"center", padding:"0 18px", gap:10 }}>
          <div style={{ background: isOffering ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "linear-gradient(135deg,#10b981,#3b82f6)", borderRadius:8, padding:"4px 10px" }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{isOffering ? "Room Available" : "Looking for Room"}</span>
          </div>
        </div>
      )}

      <div style={{ padding:"14px 16px" }}>
        {/* Title + rent */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:c.textPrimary, lineHeight:1.3, marginBottom:4 }}>{l.title}</h3>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize:12, color:c.textMuted }}>{l.location}</span>
            </div>
          </div>
          {l.rent && (
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:17, fontWeight:800, color:c.primary }}>₹{l.rent.toLocaleString()}</div>
              <div style={{ fontSize:10, color:c.textMuted }}>/month{l.rent_split ? " (split)" : ""}</div>
            </div>
          )}
        </div>

        {l.description && <p style={{ fontSize:13, color:c.textSecondary, lineHeight:1.6, marginBottom:12 }}>{l.description}</p>}

        {/* Tags */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
          {l.gender_pref !== "any" && (
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, background:"rgba(99,102,241,0.08)", color:c.primary }}>
              {l.gender_pref === "male" ? "Male Only" : "Female Only"}
            </span>
          )}
          {l.occupancy && (
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, background:"rgba(107,114,128,0.08)", color:"var(--text-secondary)" }}>
              {l.occupancy.charAt(0).toUpperCase()+l.occupancy.slice(1)} Occupancy
            </span>
          )}
          {l.available_from && (
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, background:"rgba(16,185,129,0.08)", color:"#059669" }}>
              From {new Date(l.available_from).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
            </span>
          )}
          {l.smoking_ok && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, background:"rgba(239,68,68,0.06)", color:"#ef4444" }}>Smoking OK</span>}
          {l.guests_ok  && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, background:"rgba(99,102,241,0.06)", color:c.primary }}>Guests OK</span>}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
            {amenities.map(a => (
              <div key={a} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:c.textSecondary }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {a}
              </div>
            ))}
          </div>
        )}

        {/* Posted by + actions */}
        <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:12, borderTop:"1px solid var(--border)" }}>
          <div onClick={() => navigate(l.user_id === user?.id ? "/profile" : `/user/${l.user_id}`)}
            style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, padding:1.5, flexShrink:0, cursor:"pointer" }}>
            <div style={{ width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden", border:"1px solid #fff", background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:c.primary }}>
              {l.users?.avatar_url ? <img src={l.users.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : l.users?.full_name?.charAt(0)}
            </div>
          </div>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:12, fontWeight:600, color:c.textSecondary }}>{l.users?.full_name}</span>
            {l.interest_count > 0 && <span style={{ fontSize:11, color:c.textMuted, marginLeft:8 }}>{l.interest_count} interested</span>}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            {isOwner ? (
              <div style={{ display:"flex", gap:8 }}>
                {l.interest_count > 0 && (
                  <button onClick={() => onViewInterested(l.id, l.title)} style={{
                    background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff",
                    border:"none", borderRadius:10, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:5, boxShadow:theme.shadow.btn,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                    {l.interest_count} Interested
                  </button>
                )}
                <button onClick={() => onDelete(l.id)} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", color:"#ef4444", borderRadius:10, padding:"7px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  Delete
                </button>
              </div>
            ) : (
              <>
                {l.contact && (
                  <a href={`https://wa.me/91${l.contact.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                    style={{ background:"rgba(37,211,102,0.10)", border:"1px solid rgba(37,211,102,0.25)", color:"#16a34a", borderRadius:10, padding:"7px 12px", fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"none", display:"flex", alignItems:"center", gap:5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    WhatsApp
                  </a>
                )}
                <button onClick={() => onInterest(l.id)} disabled={interesting === l.id} style={{
                  padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:12,
                  background: l.i_am_interested ? "rgba(99,102,241,0.08)" : `linear-gradient(135deg,${c.gradientA},${c.gradientB})`,
                  color:       l.i_am_interested ? c.primary : "#fff",
                  boxShadow:   l.i_am_interested ? "none" : theme.shadow.btn,
                  opacity:     interesting === l.id ? 0.6 : 1,
                }}>
                  {interesting === l.id ? "..." : l.i_am_interested ? "Interested" : "Interested"}
                </button>
                {l.i_am_interested && (
                  <button onClick={() => navigate("/messages", { state: { openChat: l.users } })} style={{
                    padding:"7px 12px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:12,
                    background:`linear-gradient(135deg,#10b981,#3b82f6)`, color:"#fff", boxShadow:theme.shadow.btn,
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    DM
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Create Listing Modal ───────────────────────
function CreateListingModal({ user, onClose, onSuccess }) {
  const [type,         setType]        = useState("offering")
  const [title,        setTitle]       = useState("")
  const [description,  setDesc]        = useState("")
  const [location,     setLocation]    = useState("")
  const [rent,         setRent]        = useState("")
  const [rentSplit,    setRentSplit]   = useState(false)
  const [genderPref,   setGenderPref]  = useState("any")
  const [occupancy,    setOccupancy]   = useState("single")
  const [availFrom,    setAvailFrom]   = useState("")
  const [wifi, setWifi]         = useState(false)
  const [ac, setAc]             = useState(false)
  const [food, setFood]         = useState(false)
  const [parking, setParking]   = useState(false)
  const [laundry, setLaundry]   = useState(false)
  const [sleepTime,    setSleepTime]   = useState("")
  const [smokingOk,    setSmokingOk]  = useState(false)
  const [guestsOk,     setGuestsOk]   = useState(false)
  const [contact,      setContact]     = useState("")
  const [photos,       setPhotos]      = useState([null, null, null])
  const [previews,     setPreviews]    = useState([null, null, null])
  const [uploading,    setUploading]   = useState(false)
  const [error,        setError]       = useState("")

  function handlePhoto(idx, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB per photo"); return }
    const newPhotos   = [...photos];   newPhotos[idx]   = file
    const newPreviews = [...previews]; newPreviews[idx] = URL.createObjectURL(file)
    setPhotos(newPhotos); setPreviews(newPreviews); setError("")
  }

  function removePhoto(idx) {
    const newPhotos   = [...photos];   newPhotos[idx]   = null
    const newPreviews = [...previews]; newPreviews[idx] = null
    setPhotos(newPhotos); setPreviews(newPreviews)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim())    return setError("Title is required.")
    if (!location.trim()) return setError("Location is required.")
    setUploading(true); setError("")
    try {
      // Upload photos
      const urls = await Promise.all(photos.map(f => f ? uploadPhoto(f, user.id) : null))
      const res  = await fetch(`${BASE}/roommates`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({
          type, title: title.trim(), description: description.trim() || null,
          location, rent: rent ? parseInt(rent) : null, rent_split: rentSplit,
          gender_pref: genderPref, occupancy, available_from: availFrom || null,
          wifi, ac, food, parking, laundry,
          sleep_time: sleepTime || null, smoking_ok: smokingOk, guests_ok: guestsOk,
          contact: contact.trim() || null,
          photo_1: urls[0], photo_2: urls[1], photo_3: urls[2],
        })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess(data)
    } catch (err) { setError(err.message || "Upload failed.") }
    finally { setUploading(false) }
  }

  const inp = { width:"100%", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", fontSize:13, color:c.textPrimary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }
  const Toggle = ({ label, value, onChange }) => (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:c.textSecondary }}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ width:15, height:15 }} />
      {label}
    </label>
  )

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"var(--bg-overlay)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:0 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:520, background:"var(--bg-elevated)", borderRadius:"24px 24px 0 0", padding:"24px 20px 32px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>

        <div style={{ width:40, height:4, borderRadius:2, background:"#e5e7eb", margin:"0 auto 20px" }} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <h3 style={{ fontSize:17, fontWeight:700, color:"var(--text-primary)" }}>Post a Listing</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {[["offering","I have a room"],["looking","I need a room"]].map(([v,l]) => (
              <button key={v} type="button" onClick={() => setType(v)} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
                background: type===v ? `linear-gradient(135deg,${c.gradientA},${c.gradientB})` : "rgba(99,102,241,0.06)",
                color: type===v ? "#fff" : c.textSecondary,
                boxShadow: type===v ? theme.shadow.btn : "none",
              }}>{l}</button>
            ))}
          </div>

          {/* Photos — only for offering */}
          {type === "offering" && (
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", display:"block", marginBottom:8 }}>
                Photos <span style={{ fontWeight:400, color:"var(--text-muted)" }}>(up to 3)</span>
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[0,1,2].map(idx => (
                  <div key={idx} style={{ aspectRatio:"1/1", borderRadius:10, overflow:"hidden", position:"relative" }}>
                    {previews[idx] ? (
                      <>
                        <img src={previews[idx]} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                        <button type="button" onClick={() => removePhoto(idx)} style={{ position:"absolute", top:4, right:4, background:"var(--bg-overlay)", border:"none", borderRadius:"50%", width:22, height:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </>
                    ) : (
                      <label style={{ width:"100%", height:"100%", background:"rgba(99,102,241,0.05)", border:"1.5px dashed rgba(99,102,241,0.25)", borderRadius:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style={{ fontSize:9, color:c.primary, fontWeight:600 }}>Photo {idx+1}</span>
                        <input type="file" accept="image/*" onChange={e => handlePhoto(idx, e.target.files[0])} style={{ display:"none" }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom:12 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title e.g. 'Single room in Phagwara Sector 7'" style={{ ...inp, fontWeight:600, fontSize:14 }} />
          </div>

          <div style={{ marginBottom:12 }}>
            <select value={location} onChange={e => setLocation(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              <option value="">Select Area *</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <input value={rent} onChange={e => setRent(e.target.value)} placeholder="Rent per month (₹)" type="number" style={inp} />
            <input value={availFrom} onChange={e => setAvailFrom(e.target.value)} type="date" style={inp} />
          </div>

          <div style={{ marginBottom:12 }}>
            <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Describe the room/what you're looking for..." style={{ ...inp, resize:"none", height:80 }} />
          </div>

          {/* Options row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            <select value={genderPref} onChange={e => setGenderPref(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              <option value="any">Any Gender</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
            <select value={occupancy} onChange={e => setOccupancy(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              <option value="single">Single</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
            </select>
          </div>

          {/* Amenities — offering only */}
          {type === "offering" && (
            <div style={{ marginBottom:14, padding:"12px 14px", background:"rgba(99,102,241,0.04)", borderRadius:12 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:10 }}>Amenities included</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <Toggle label="WiFi"     value={wifi}    onChange={setWifi} />
                <Toggle label="AC"       value={ac}      onChange={setAc} />
                <Toggle label="Food"     value={food}    onChange={setFood} />
                <Toggle label="Parking"  value={parking} onChange={setParking} />
                <Toggle label="Laundry"  value={laundry} onChange={setLaundry} />
                <Toggle label="Rent Split" value={rentSplit} onChange={setRentSplit} />
              </div>
            </div>
          )}

          {/* Habits */}
          <div style={{ marginBottom:14, padding:"12px 14px", background:"rgba(99,102,241,0.04)", borderRadius:12 }}>
            <p style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginBottom:10 }}>Preferences</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <Toggle label="Smoking OK"  value={smokingOk} onChange={setSmokingOk} />
              <Toggle label="Guests OK"   value={guestsOk}  onChange={setGuestsOk} />
            </div>
            <select value={sleepTime} onChange={e => setSleepTime(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
              <option value="">Sleep schedule (optional)</option>
              <option value="early">Early Bird (before 11pm)</option>
              <option value="late">Night Owl (after 1am)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div style={{ marginBottom:18 }}>
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="WhatsApp number (optional, shown to interested)" style={inp} />
          </div>

          {error && <p style={{ fontSize:12, color:"#ef4444", marginBottom:12, fontWeight:500 }}>{error}</p>}

          <button type="submit" disabled={uploading} style={{ width:"100%", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:14, padding:"14px", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:theme.shadow.btn, opacity:uploading?0.7:1 }}>
            {uploading ? "Uploading photos..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  )
}