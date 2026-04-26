// src/pages/CommunityDetail.jsx
import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import PageLayout from "../components/PageLayout"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth.jsx"
import { uploadImage } from "../lib/api"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff/60)}m`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  return `${Math.floor(diff/86400)}d`
}

export default function CommunityDetail() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [sort, setSort]           = useState("new")
  const [showCreate, setShowCreate] = useState(false)
  const [joining, setJoining]     = useState(false)

  useEffect(() => { fetchCommunity() }, [slug])
  useEffect(() => { if (community) fetchPosts() }, [community, sort])

  async function fetchCommunity() {
    setLoading(true)
    try {
      const res  = await fetch(`${BASE}/communities/${slug}`, { headers: await authHeaders() })
      const data = await res.json()
      if (data.error) return navigate("/communities")
      setCommunity(data)
    } catch {}
    setLoading(false)
  }

  async function fetchPosts(page = 1) {
    setPostsLoading(true)
    try {
      const res  = await fetch(`${BASE}/communities/${community.id}/posts?sort=${sort}&page=${page}`, { headers: await authHeaders() })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch { setPosts([]) }
    setPostsLoading(false)
  }

  async function toggleJoin() {
    if (!community) return
    setJoining(true)
    try {
      const res  = await fetch(`${BASE}/communities/${community.id}/join`, { method: "POST", headers: await authHeaders() })
      const data = await res.json()
      setCommunity(prev => ({ ...prev, is_member: data.joined, members_count: data.joined ? prev.members_count + 1 : Math.max(0, prev.members_count - 1) }))
    } catch {}
    setJoining(false)
  }

  async function handleVote(postId, vote) {
    try {
      const res  = await fetch(`${BASE}/communities/${community.id}/posts/${postId}/vote`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ vote })
      })
      const data = await res.json()
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        const prevVote = p.user_vote || 0
        let upvotes    = p.upvotes
        let downvotes  = p.downvotes

        // Revert old vote
        if (prevVote === 1)  upvotes   = Math.max(0, upvotes - 1)
        if (prevVote === -1) downvotes = Math.max(0, downvotes - 1)

        // Apply new vote
        if (data.user_vote === 1)  upvotes++
        if (data.user_vote === -1) downvotes++

        return { ...p, upvotes, downvotes, user_vote: data.user_vote }
      }))
    } catch {}
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setCommunity(prev => ({ ...prev, posts_count: Math.max(0, prev.posts_count - 1) }))
  }

  if (loading) {
    return (
      <PageLayout maxWidth={720}>
        <div style={{ height: 160, background: "rgba(99,102,241,0.06)", borderRadius: 16, marginBottom: 12 }} />
        <div style={{ height: 80, background: "rgba(99,102,241,0.06)", borderRadius: 14 }} />
      </PageLayout>
    )
  }

  if (!community) return null

  return (
    <PageLayout maxWidth={720}>
      {/* Banner */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{
          height: 120, borderRadius: 16, overflow: "hidden",
          background: community.banner_url ? "transparent" : `linear-gradient(135deg, ${c.gradientA}33, ${c.gradientB}33)`,
          marginBottom: -30,
        }}>
          {community.banner_url && <img src={community.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
        </div>

        {/* Community info card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px", marginTop: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${c.gradientA}22, ${c.gradientB}22)`, border: `1px solid ${c.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
              {community.icon_url ? <img src={community.icon_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "🌐"}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: c.textPrimary, letterSpacing: "-0.3px" }}>c/{community.name}</h1>
              {community.description && <p style={{ fontSize: 13, color: c.textSecondary, marginTop: 4, lineHeight: 1.5 }}>{community.description}</p>}
            </div>
            <button onClick={toggleJoin} disabled={joining} style={{
              padding: "8px 18px", borderRadius: 24, flexShrink: 0,
              background: community.is_member ? "white" : `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
              border: community.is_member ? "1px solid var(--border)" : "none",
              color: community.is_member ? c.textSecondary : "#fff",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              boxShadow: community.is_member ? "none" : theme.shadow.btn,
              opacity: joining ? 0.6 : 1,
            }}>
              {joining ? "..." : community.is_member ? "Joined" : "Join"}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: c.textPrimary }}>{community.members_count?.toLocaleString() || 0}</p>
              <p style={{ fontSize: 11, color: c.textMuted }}>Members</p>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: c.textPrimary }}>{community.posts_count || 0}</p>
              <p style={{ fontSize: 11, color: c.textMuted }}>Posts</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              {community.is_member && (
                <button onClick={() => setShowCreate(true)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
                  color: "#fff", border: "none", borderRadius: 12,
                  padding: "8px 14px", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", boxShadow: theme.shadow.btn,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["new", "top"].map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            padding: "7px 16px", borderRadius: 24,
            background: sort === s ? `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})` : "var(--bg-card)",
            border: `1px solid ${sort === s ? "transparent" : "rgba(200,200,220,0.50)"}`,
            color: sort === s ? "#fff" : c.textSecondary,
            fontWeight: sort === s ? 700 : 400, fontSize: 13,
            cursor: "pointer", textTransform: "capitalize",
          }}>
            {s === "new" ? "New" : "Top"}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 100, background: "rgba(99,102,241,0.06)", borderRadius: 14 }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <p style={{ fontWeight: 700, color: c.textPrimary, marginBottom: 6 }}>No posts yet</p>
          {community.is_member
            ? <button onClick={() => setShowCreate(true)} style={{ background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: theme.shadow.btn }}>Create First Post</button>
            : <p style={{ fontSize: 13, color: c.textMuted }}>Join this community to post</p>
          }
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map(post => (
            <CommunityPost
              key={post.id}
              post={post}
              communityId={community.id}
              user={user}
              onVote={handleVote}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePostModal
          community={community}
          onClose={() => setShowCreate(false)}
          onSuccess={post => { setPosts(prev => [post, ...prev]); setShowCreate(false); setCommunity(prev => ({ ...prev, posts_count: prev.posts_count + 1 })) }}
        />
      )}
    </PageLayout>
  )
}

// ── Community Post Card ────────────────────────
function CommunityPost({ post, communityId, user, onVote, onDelete }) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState([])
  const [newComment, setNewComment]     = useState("")
  const [loadingCmts, setLoadingCmts]   = useState(false)
  const [posting, setPosting]           = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const isOwner = post.user_id === user?.id
  const score   = (post.upvotes || 0) - (post.downvotes || 0)

  async function loadComments() {
    if (comments.length > 0) { setShowComments(s => !s); return }
    setShowComments(true)
    setLoadingCmts(true)
    try {
      const res  = await fetch(`${BASE}/communities/${communityId}/posts/${post.id}/comments`, { headers: await authHeaders() })
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
      const res  = await fetch(`${BASE}/communities/${communityId}/posts/${post.id}/comments`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ content: newComment.trim() })
      })
      const data = await res.json()
      if (data.id) { setComments(prev => [...prev, data]); setNewComment("") }
    } catch {}
    setPosting(false)
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post?")) return
    setDeleting(true)
    await fetch(`${BASE}/communities/${communityId}/posts/${post.id}`, { method: "DELETE", headers: await authHeaders() })
    onDelete(post.id)
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", opacity: deleting ? 0.5 : 1 }}>
      <div style={{ display: "flex", gap: 0 }}>
        {/* Vote column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "14px 10px", background: "rgba(99,102,241,0.03)", borderRight: "1px solid rgba(200,200,220,0.20)" }}>
          <button onClick={() => onVote(post.id, 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: post.user_vote === 1 ? c.primary : c.textMuted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={post.user_vote === 1 ? c.primary : "none"} stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: post.user_vote === 1 ? c.primary : post.user_vote === -1 ? "#ef4444" : c.textSecondary, minWidth: 20, textAlign: "center" }}>
            {score > 0 ? `+${score}` : score}
          </span>
          <button onClick={() => onVote(post.id, -1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: post.user_vote === -1 ? "#ef4444" : c.textMuted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={post.user_vote === -1 ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, padding: "12px 14px" }}>
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div onClick={() => navigate(post.user_id === user?.id ? "/profile" : `/user/${post.user_id}`)}
              style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 1.5, flexShrink: 0, cursor: "pointer" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c.primary }}>
                {post.users?.avatar_url ? <img src={post.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : post.users?.full_name?.charAt(0)}
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{post.users?.full_name}</span>
            <span style={{ fontSize: 11, color: c.textMuted }}>{timeAgo(post.created_at)} ago</span>
            {isOwner && (
              <button onClick={handleDelete} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 6 }}>
                Delete
              </button>
            )}
          </div>

          {/* Title */}
          <p style={{ fontSize: 15, fontWeight: 700, color: c.textPrimary, lineHeight: 1.4, marginBottom: 6 }}>{post.title}</p>

          {/* Content */}
          {post.content && <p style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{post.content}</p>}

          {/* Image */}
          {post.image_url && (
            <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
              <img src={post.image_url} style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} loading="lazy" alt="" />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={loadComments} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: c.textMuted, fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {post.comments_count || 0} Comments
            </button>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 14px 14px" }}>
          {loadingCmts ? (
            <p style={{ color: c.textMuted, fontSize: 12 }}>Loading...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: c.textMuted, fontSize: 12 }}>No comments yet. Be the first!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              {comments.map(cmt => (
                <div key={cmt.id} style={{ display: "flex", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {cmt.users?.avatar_url ? <img src={cmt.users.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : cmt.users?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.textPrimary, marginRight: 6 }}>{cmt.users?.full_name}</span>
                    <span style={{ fontSize: 12, color: c.textSecondary }}>{cmt.content}</span>
                    <p style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>{timeAgo(cmt.created_at)} ago</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} style={{ display: "flex", gap: 8 }}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..."
              style={{ flex: 1, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 24, padding: "8px 14px", fontSize: 13, color: c.textPrimary, outline: "none" }}
              onFocus={e => e.target.style.borderColor = c.primary}
              onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.15)"}
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

// ── Create Post Modal ──────────────────────────
function CreatePostModal({ community, onClose, onSuccess }) {
  const { user } = useAuth()
  const [title, setTitle]       = useState("")
  const [content, setContent]   = useState("")
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError("Title is required.")
    setLoading(true); setError("")
    try {
      let image_url = null
      if (file) image_url = await uploadImage("posts", file, user.id)

      const res  = await fetch(`${BASE}/communities/${community.id}/posts`, {
        method: "POST", headers: await authHeaders(),
        body: JSON.stringify({ title: title.trim(), content: content.trim() || null, image_url })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess(data)
    } catch (err) { setError(err.message || "Something went wrong.") }
    finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "var(--bg-elevated)", borderRadius: 24, padding: "24px 20px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Create Post</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>c/{community.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title *"
              style={{ width: "100%", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "11px 14px", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = theme.colors.primary}
              onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.15)"}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind? (optional)"
              style={{ width: "100%", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "var(--text-primary)", outline: "none", resize: "none", height: 120, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Image */}
          {preview ? (
            <div style={{ position: "relative", marginBottom: 14 }}>
              <img src={preview} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12 }} alt="" />
              <button type="button" onClick={() => { setFile(null); setPreview(null) }}
                style={{ position: "absolute", top: 8, right: 8, background: "var(--bg-overlay)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(99,102,241,0.04)", border: "1px dashed rgba(99,102,241,0.25)", borderRadius: 12, cursor: "pointer", marginBottom: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: 13, color: theme.colors.primary, fontWeight: 600 }}>Add Image (optional)</span>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
          )}

          {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, fontWeight: 500 }}>{error}</p>}

          <button type="submit" disabled={loading || !title.trim()} style={{ width: "100%", background: `linear-gradient(135deg, ${theme.colors.gradientA}, ${theme.colors.gradientB})`, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: (loading || !title.trim()) ? 0.6 : 1 }}>
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  )
}