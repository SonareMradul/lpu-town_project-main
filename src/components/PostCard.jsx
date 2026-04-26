// src/components/PostCard.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

function timeAgo(date) {
  if (!date) return ""
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PostCard({ id, name, username, caption, image, likes = 0, comments = 0, avatar, userId, createdAt, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [liked, setLiked]               = useState(false)
  const [likeCount, setLikeCount]       = useState(Number(likes))
  const [showComments, setShowComments] = useState(false)
  const [commentList, setCommentList]   = useState([])
  const [commentCount, setCommentCount] = useState(Number(comments))
  const [newComment, setNewComment]     = useState("")
  const [loadingCmts, setLoadingCmts]   = useState(false)
  const [posting, setPosting]           = useState(false)
  const [likeLoading, setLikeLoading]   = useState(false)
  const [hovered, setHovered]           = useState(false)
  const [showMenu, setShowMenu]         = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const menuRef = useRef(null)
  const isOwner = user?.id === userId

  useEffect(() => {
    if (!id || !user?.id) return
    supabase.from("likes").select("*")
      .eq("post_id", id).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setLiked(true) })
  }, [id, user?.id])

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenu])

  async function handleLike() {
    if (likeLoading) return
    setLikeLoading(true)
    const was = liked
    setLiked(!was); setLikeCount(n => was ? n - 1 : n + 1)
    try {
      const res  = await fetch(`${BASE}/posts/${id}/like`, { method: "POST", headers: await authHeaders() })
      const data = await res.json()
      setLiked(data.liked)
    } catch { setLiked(was); setLikeCount(n => was ? n + 1 : n - 1) }
    finally { setLikeLoading(false) }
  }

  async function handleToggleComments() {
    if (!showComments && commentList.length === 0) {
      setLoadingCmts(true)
      try {
        const res  = await fetch(`${BASE}/posts/${id}/comments`, { headers: await authHeaders() })
        const data = await res.json()
        setCommentList(Array.isArray(data) ? data : [])
      } catch { setCommentList([]) }
      setLoadingCmts(false)
    }
    setShowComments(p => !p)
  }

  async function handlePostComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setPosting(true)
    try {
      const res  = await fetch(`${BASE}/posts/${id}/comments`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ content: newComment.trim() })
      })
      const data = await res.json()
      if (data.id) {
        setCommentList(prev => [...prev, {
          ...data,
          users: { full_name: user.user_metadata?.full_name || "You", username: user.email?.split("@")[0] }
        }])
        setCommentCount(n => n + 1)
        setNewComment("")
      }
    } catch {}
    setPosting(false)
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return
    setDeleting(true)
    setShowMenu(false)
    try {
      await fetch(`${BASE}/posts/${id}`, { method: "DELETE", headers: await authHeaders() })
      onDelete?.(id)
    } catch {}
    setDeleting(false)
  }

  function goToProfile() {
    if (!userId) return
    userId === user?.id ? navigate("/profile") : navigate(`/user/${userId}`)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:     "var(--bg-card)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        border:         `1px solid ${hovered ? "rgba(99,102,241,0.20)" : "var(--bg-card)"}`,
        borderRadius:   16,
        overflow:       "hidden",
        transition:     "all 0.25s ease",
        transform:      hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow:      hovered ? theme.shadow.hover : theme.shadow.card,
        opacity:        deleting ? 0.5 : 1,
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div onClick={goToProfile} style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, cursor: "pointer", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 1.5 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1.5px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c.primary }}>
            {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={name} /> : name?.charAt(0)}
          </div>
        </div>

        <div style={{ flex: 1, cursor: "pointer" }} onClick={goToProfile}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.textPrimary }}>{name}</div>
          <div style={{ fontSize: 11, color: c.textMuted }}>{timeAgo(createdAt)}</div>
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, padding: "4px 8px", borderRadius: 8, fontSize: 16, letterSpacing: 1 }}
          >
            ···
          </button>

          {showMenu && (
            <div style={{
              position: "absolute", top: "100%", right: 0, zIndex: 50,
              background: "var(--bg-elevated)", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.06)",
              minWidth: 160, overflow: "hidden",
            }}>
              <button onClick={goToProfile} style={{ width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-primary)", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                View Profile
              </button>

              <button onClick={() => { navigator.clipboard?.writeText(window.location.origin + `/post/${id}`); setShowMenu(false) }}
                style={{ width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-primary)", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share Post
              </button>

              {isOwner && (
                <>
                  <div style={{ height: 1, background: "var(--bg-input)", margin: "4px 0" }} />
                  <button onClick={handleDelete} style={{ width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Delete Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div style={{ overflow: "hidden" }}>
        <img
          src={image}
          onDoubleClick={handleLike}
          style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", transition: "transform 0.4s ease", transform: hovered ? "scale(1.02)" : "scale(1)", cursor: "pointer" }}
          alt="post"
        />
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 14px 6px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={handleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 8, transition: "all 0.18s" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "#e11d48" : "none"} stroke={liked ? "#e11d48" : c.textSecondary} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likeCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{likeCount}</span>}
        </button>

        <button onClick={handleToggleComments} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 8, transition: "all 0.18s" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showComments ? c.primary : c.textSecondary} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {commentCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{commentCount}</span>}
        </button>
      </div>

      {/* Caption */}
      <div style={{ padding: "0 14px 12px" }}>
        {likeCount > 0 && (
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textPrimary, marginBottom: 4 }}>
            {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
          </div>
        )}
        {caption && (
          <div style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: c.textPrimary, marginRight: 5 }}>{username}</span>
            {caption}
          </div>
        )}
        {commentCount > 0 && !showComments && (
          <button onClick={handleToggleComments} style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 12, padding: "4px 0 0", display: "block" }}>
            View all {commentCount} comments
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: "1px solid rgba(99,102,241,0.08)", padding: "12px 14px" }}>
          {loadingCmts ? (
            <div style={{ color: c.textMuted, fontSize: 12 }}>Loading...</div>
          ) : commentList.length === 0 ? (
            <div style={{ color: c.textMuted, fontSize: 12 }}>No comments yet. Be the first!</div>
          ) : (
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {commentList.map(cmt => (
                <div key={cmt.id} style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {cmt.users?.avatar_url
                      ? <img src={cmt.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : cmt.users?.full_name?.charAt(0)
                    }
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.textPrimary, marginRight: 5 }}>{cmt.users?.full_name}</span>
                    <span style={{ fontSize: 12, color: c.textSecondary }}>{cmt.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handlePostComment} style={{ display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid rgba(99,102,241,0.08)", paddingTop: 10 }}>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: c.textPrimary }}
            />
            <button type="submit" disabled={posting || !newComment.trim()} style={{ background: "none", border: "none", cursor: "pointer", color: c.primary, fontWeight: 700, fontSize: 13, opacity: !newComment.trim() ? 0.4 : 1 }}>
              {posting ? "..." : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}