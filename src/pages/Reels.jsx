// src/pages/Reels.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import DesktopSidebar from "../components/DesktopSidebar"
import { getReels, createReel, uploadVideo, uploadImage, generateThumbnail } from "../lib/api"
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

export default function Reels() {
  const { user }  = useAuth()
  const isMobile  = useIsMobile()
  const [reels, setReels]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [fullscreen, setFullscreen] = useState(null)

  useEffect(() => { fetchReels() }, [])

  async function fetchReels() {
    setLoading(true)
    const data = await getReels()
    setReels(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function handleDelete(reelId) {
    setReels(prev => prev.filter(r => r.id !== reelId))
    setFullscreen(null)
  }

  const cols = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))"

  const grid = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px" }}>Reels</h2>
        <button onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: theme.shadow.btn }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Upload
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ aspectRatio: "9/16", borderRadius: 14, background: "rgba(99,102,241,0.06)" }} />)}
        </div>
      ) : reels.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 20 }}>
          <p style={{ fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>No reels yet</p>
          <button onClick={() => setShowUpload(true)} style={{ background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: theme.shadow.btn }}>Upload First Reel</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
          {reels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} user={user} onClick={() => setFullscreen(i)} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      {isMobile ? (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ padding: `calc(${theme.navbar.height} + 14px) 12px calc(${theme.bottomNav.height} + 16px)` }}>
            {grid}
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: `calc(${theme.navbar.height} + 20px) 20px 40px`, display: "flex", gap: 24, alignItems: "flex-start" }}>
            <DesktopSidebar />
            <div style={{ flex: 1 }}>{grid}</div>
          </div>
        </div>
      )}

      {fullscreen !== null && (
        <FullscreenPlayer
          reels={reels} startIndex={fullscreen}
          onClose={() => setFullscreen(null)}
          user={user} onDelete={handleDelete}
        />
      )}
      {showUpload && (
        <UploadModal user={user} onClose={() => setShowUpload(false)}
          onSuccess={reel => { setReels(prev => [reel, ...prev]); setShowUpload(false) }} />
      )}
      {isMobile && <BottomNav />}
    </div>
  )
}

// ── Grid card ──────────────────────────────────
function ReelCard({ reel, user, onClick, onDelete }) {
  const videoRef = useRef(null)
  const isOwner  = reel.user_id === user?.id
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  async function handleDelete(e) {
    e.stopPropagation()
    if (!window.confirm("Delete this reel? This cannot be undone.")) return
    setMenuOpen(false)
    await fetch(`${BASE}/reels/${reel.id}`, { method: "DELETE", headers: await authHeaders() })
    onDelete(reel.id)
  }

  return (
    <div style={{ position: "relative", aspectRatio: "9/16", borderRadius: 14, overflow: "hidden", cursor: "pointer", background: "#111", transition: "transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; videoRef.current?.play().catch(() => {}) }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }}
      onClick={onClick}
    >
      {reel.thumbnail_url && <img src={reel.thumbnail_url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
      <video ref={videoRef} src={reel.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" loop />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />

      {/* Play icon */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.22)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
        <p style={{ fontSize: 11, color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reel.users?.full_name}</p>
        {reel.caption && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reel.caption}</p>}
      </div>

      {/* Views */}
      <div style={{ position: "absolute", top: 7, left: 7, background: "rgba(0,0,0,0.35)", backdropFilter: "none", borderRadius: 10, padding: "3px 7px" }}>
        <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{reel.views || 0} views</span>
      </div>

      {/* Owner menu */}
      {isOwner && (
        <div ref={menuRef} style={{ position: "absolute", top: 7, right: 7 }} onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(m => !m) }} style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "none", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            ···
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", top: "100%", right: 0, background: "var(--bg-elevated)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden", minWidth: 130, zIndex: 10 }}>
              <button onClick={handleDelete} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                Delete Reel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Fullscreen player ──────────────────────────
function FullscreenPlayer({ reels, startIndex, onClose, user, onDelete }) {
  const [current, setCurrent] = useState(startIndex)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current?.children[startIndex]
    if (el) el.scrollIntoView({ behavior: "instant" })
  }, [])

  useEffect(() => {
    document.body.classList.add("story-open")
    return () => {
      document.body.classList.remove("story-open")
    }
  }, [])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
      <button onClick={onClose} style={{ position: "fixed", top: 16, right: 16, zIndex: 10, background: "rgba(255,255,255,0.15)", backdropFilter: "none", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div ref={containerRef} style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory" }}>
        {reels.map((reel, i) => (
          <FullscreenItem key={reel.id} reel={reel} onVisible={() => setCurrent(i)} user={user} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

// ── Fullscreen single item ─────────────────────
function FullscreenItem({ reel, onVisible, user, onDelete }) {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const itemRef  = useRef(null)

  const [liked, setLiked]             = useState(false)
  const [likeCount, setLikeCount]     = useState(0)
  const [muted, setMuted]             = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]       = useState([])
  const [newComment, setNewComment]   = useState("")
  const [loadingCmts, setLoadingCmts] = useState(false)
  const [posting, setPosting]         = useState(false)
  const [showMenu, setShowMenu]       = useState(false)
  const menuRef = useRef(null)
  const isOwner = reel.user_id === user?.id

  useEffect(() => { fetchLikes() }, [reel.id])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) { onVisible(); videoRef.current?.play().catch(() => {}) }
        else videoRef.current?.pause()
      },
      { threshold: 0.7 }
    )
    if (itemRef.current) obs.observe(itemRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!showMenu) return
    function handler(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenu])

  async function fetchLikes() {
    try {
      const res  = await fetch(`${BASE}/reels/${reel.id}/likes`, { headers: await authHeaders() })
      const data = await res.json()
      setLikeCount(data.count || 0); setLiked(data.liked || false)
    } catch {}
  }

  async function handleLike() {
    if (likeLoading) return
    setLikeLoading(true)
    const was = liked; setLiked(!was); setLikeCount(n => was ? n-1 : n+1)
    try {
      const res  = await fetch(`${BASE}/reels/${reel.id}/like`, { method: "POST", headers: await authHeaders() })
      const data = await res.json(); setLiked(data.liked)
    } catch { setLiked(was); setLikeCount(n => was ? n+1 : n-1) }
    finally { setLikeLoading(false) }
  }

  async function loadComments() {
    setLoadingCmts(true)
    try {
      const res  = await fetch(`${BASE}/reels/${reel.id}/comments`, { headers: await authHeaders() })
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } catch { setComments([]) }
    setLoadingCmts(false)
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setPosting(true)
    try {
      const res  = await fetch(`${BASE}/reels/${reel.id}/comments`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ content: newComment.trim() })
      })
      const data = await res.json()
      if (data.id) {
        setComments(prev => [...prev, { ...data, users: { full_name: user.user_metadata?.full_name || "You" } }])
        setNewComment("")
      }
    } catch {}
    setPosting(false)
  }

  async function handleDelete() {
    if (!window.confirm("Delete this reel?")) return
    setShowMenu(false)
    await fetch(`${BASE}/reels/${reel.id}`, { method: "DELETE", headers: await authHeaders() })
    onDelete(reel.id)
  }

  function goToProfile() {
    if (!reel.user_id) return
    navigate(reel.user_id === user?.id ? "/profile" : `/user/${reel.user_id}`)
  }

  return (
    <div ref={itemRef} style={{ height: "100vh", scrollSnapAlign: "start", position: "relative", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video ref={videoRef} src={reel.video_url} style={{ width: "100%", height: "100%", objectFit: "contain", maxWidth: 480 }} loop playsInline muted={muted} poster={reel.thumbnail_url} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)", pointerEvents: "none" }} />

      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: 80, left: 16, right: 70 }}>
        {/* Clickable user info */}
        <div onClick={goToProfile} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", background: "#333", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", border: "2px solid rgba(255,255,255,0.5)" }}>
            {reel.users?.avatar_url
              ? <img src={reel.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : reel.users?.full_name?.charAt(0)
            }
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{reel.users?.full_name}</p>
            {reel.users?.username && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>@{reel.users.username}</p>}
          </div>
        </div>
        {reel.caption && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.5 }}>{reel.caption}</p>}
      </div>

      {/* Right action buttons */}
      <div style={{ position: "absolute", bottom: 80, right: 14, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        {/* Like */}
        <ActionBtn onClick={handleLike} label={likeCount} icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "#f43f5e" : "none"} stroke={liked ? "#f43f5e" : "white"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        } />

        {/* Comments */}
        <ActionBtn onClick={() => { setShowComments(true); loadComments() }} label={comments.length || ""} icon={
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        } />

        {/* Mute */}
        <ActionBtn onClick={() => setMuted(m => !m)} icon={
          muted
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        } />

        {/* Views */}
        <ActionBtn icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>} label={reel.views || 0} />

        {/* Owner menu */}
        {isOwner && (
          <div ref={menuRef} style={{ position: "relative" }}>
            <ActionBtn onClick={() => setShowMenu(m => !m)} icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            } />
            {showMenu && (
              <div style={{ position: "absolute", bottom: "100%", right: 0, background: "var(--bg-elevated)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden", minWidth: 140, marginBottom: 8, zIndex: 10 }}>
                <button onClick={handleDelete} style={{ width: "100%", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                  Delete Reel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments bottom sheet */}
      {showComments && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--bg-card)", backdropFilter: "none", borderRadius: "20px 20px 0 0", maxHeight: "60vh", display: "flex", flexDirection: "column", zIndex: 10 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Comments</p>
            <button onClick={() => setShowComments(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {loadingCmts ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</p>
            ) : comments.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No comments yet. Be the first!</p>
            ) : comments.map(cmt => (
              <div key={cmt.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                  {cmt.users?.avatar_url ? <img src={cmt.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : cmt.users?.full_name?.charAt(0)}
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginRight: 6 }}>{cmt.users?.full_name}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{cmt.content}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} style={{ padding: "10px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 10 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..."
              style={{ flex: 1, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: 24, padding: "9px 14px", fontSize: 13, color: "var(--text-primary)", outline: "none" }}
            />
            <button type="submit" disabled={!newComment.trim() || posting} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: !newComment.trim() ? 0.4 : 1, flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      {label !== undefined && label !== "" && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{label}</span>}
    </button>
  )
}

function UploadModal({ user, onClose, onSuccess }) {
  const [videoFile, setVideoFile] = useState(null)
  const [preview, setPreview]     = useState(null)
  const [caption, setCaption]     = useState("")
  const [progress, setProgress]   = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState("")
  const [stage, setStage]         = useState("")

  function handleSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { setError("Max 50MB"); return }
    setVideoFile(file); setPreview(URL.createObjectURL(file)); setError("")
  }

  async function handleUpload() {
    if (!videoFile) return setError("Select a video first.")
    setUploading(true); setError("")
    try {
      setStage("Uploading video...")
      const video_url = await uploadVideo(videoFile, user.id, setProgress)
      setStage("Generating thumbnail..."); setProgress(0)
      const thumbBlob = await generateThumbnail(videoFile)
      let thumbnail_url = null
      if (thumbBlob) thumbnail_url = await uploadImage("reels", new File([thumbBlob], "thumb.jpg", { type: "image/jpeg" }), user.id)
      setStage("Saving...")
      const reel = await createReel(caption, video_url, thumbnail_url)
      onSuccess(reel)
    } catch (err) { setError(err.message || "Upload failed.") }
    finally { setUploading(false); setStage(""); setProgress(0) }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--bg-elevated)", borderRadius: 22, padding: "22px 18px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Upload Reel</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: 200, background: preview ? "transparent" : "rgba(99,102,241,0.04)", border: `1.5px dashed ${preview ? "transparent" : "rgba(99,102,241,0.25)"}`, borderRadius: 14, cursor: "pointer", overflow: "hidden", marginBottom: 12 }}>
          {preview ? <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline /> : (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>Select video</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>MP4, MOV · max 50MB</p>
            </div>
          )}
          <input type="file" accept="video/*" onChange={handleSelect} style={{ display: "none" }} />
        </label>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." style={{ width: "100%", background: "var(--bg-input)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "var(--text-primary)", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
        {uploading && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 5 }}><span>{stage}</span><span>{progress}%</span></div>
            <div style={{ height: 4, background: "rgba(99,102,241,0.1)", borderRadius: 4 }}>
              <div style={{ height: "100%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, borderRadius: 4, width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        )}
        {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, fontWeight: 500 }}>{error}</p>}
        <button onClick={handleUpload} disabled={uploading || !videoFile} style={{ width: "100%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (uploading || !videoFile) ? 0.6 : 1 }}>
          {uploading ? stage || "Uploading..." : "Upload Reel"}
        </button>
      </div>
    </div>
  )
}