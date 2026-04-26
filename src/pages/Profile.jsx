// src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import { getMyProfile, updateProfile, uploadImage } from "../lib/api"
import { useAuth } from "../hooks/useAuth.jsx"
import { supabase } from "../lib/supabase"
import theme from "../theme"

const c = theme.colors


export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const avatarRef = useRef(null)

  const [profile, setProfile]     = useState(null)
  const [posts, setPosts]         = useState([])
  const [reels, setReels]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [activeTab, setActiveTab] = useState("posts")
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedReel, setSelectedReel] = useState(null)
  const [form, setForm] = useState({ full_name: "", username: "", bio: "" })

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    setLoading(true)
    const data = await getMyProfile()
    setProfile(data)
    setForm({ full_name: data?.full_name || "", username: data?.username || "", bio: data?.bio || "" })
    const { data: userPosts } = await supabase.from("posts_with_meta").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    setPosts(userPosts || [])
    const { data: userReels } = await supabase.from("reels").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    setReels(userReels || [])
    const [{ count: frs }, { count: fing }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
    ])
    setFollowers(frs || 0); setFollowing(fing || 0)
    setLoading(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const avatar_url = await uploadImage("avatars", file, user.id)
      await updateProfile({ avatar_url })
      setProfile(p => ({ ...p, avatar_url }))
    } catch (err) { alert(err.message) }
    finally { setAvatarUploading(false) }
  }

  async function handleSave() {
    setSaving(true)
    const updated = await updateProfile(form)
    setProfile(updated); setEditing(false); setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: c.bgPage }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: `calc(${theme.navbar.height} + 20px) 14px` }}>
          <div style={{ background: c.bgGlass, backdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.xl, height: 200, marginBottom: 12 }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: c.bgPage }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", top: -80, right: -40 }} />
        <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", bottom: 100, left: -40 }} />
      </div>

      <Navbar />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: `calc(${theme.navbar.height} + 16px) 14px calc(${theme.bottomNav.height} + 16px)`, position: "relative", zIndex: 1 }}>

        {/* Profile Card */}
        <div style={{ background: c.bgGlass, backdropFilter: theme.blur, WebkitBackdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.xl, padding: "24px 20px", marginBottom: 12 }}>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div onClick={() => avatarRef.current?.click()} style={{
                width: 80, height: 80, borderRadius: "50%",
                background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
                padding: 2.5, cursor: "pointer",
              }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: c.primary }}>
                  {avatarUploading ? "..." : profile?.avatar_url
                    ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : profile?.full_name?.charAt(0)
                  }
                </div>
              </div>
              <div onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid white" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" style={{ display: "none" }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Full Name" style={{ background: c.bgInput, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "8px 12px", fontSize: 13, color: c.textPrimary, outline: "none", width: "100%" }} />
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Username" style={{ background: c.bgInput, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "8px 12px", fontSize: 13, color: c.textPrimary, outline: "none", width: "100%" }} />
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Bio..." style={{ background: c.bgInput, border: `1px solid ${c.border}`, borderRadius: theme.radius.md, padding: "8px 12px", fontSize: 13, color: c.textPrimary, outline: "none", width: "100%", resize: "none", height: 60 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: theme.radius.md, padding: "8px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{saving ? "Saving..." : "Save"}</button>
                    <button onClick={() => setEditing(false)} style={{ flex: 1, background: c.bgInput, border: `1px solid ${c.border}`, color: c.textSecondary, borderRadius: theme.radius.md, padding: "8px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 17, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px" }}>{profile?.full_name}</p>
                  <p style={{ fontSize: 13, color: c.primary, fontWeight: 500, marginTop: 2 }}>@{profile?.username}</p>
                  {profile?.bio && <p style={{ fontSize: 13, color: c.textSecondary, marginTop: 6, lineHeight: 1.5 }}>{profile.bio}</p>}
                  {profile?.reg_number && <p style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>Reg: {profile.reg_number}</p>}
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: `1px solid rgba(99,102,241,0.08)`, paddingTop: 16, marginBottom: 16 }}>
            {[
              { label: "Posts",     val: posts.length },
              { label: "Reels",     val: reels.length },
              { label: "Followers", val: followers },
              { label: "Following", val: following },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? `1px solid rgba(99,102,241,0.08)` : "none" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.5px" }}>{s.val}</p>
                <p style={{ fontSize: 11, color: c.textMuted, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!editing && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditing(true)} style={{ flex: 1, background: c.primaryLight, border: `1px solid ${c.borderAccent}`, color: c.primary, borderRadius: theme.radius.md, padding: "9px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Edit Profile</button>
              <button onClick={logout} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: theme.radius.md, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Logout</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: c.bgGlass, backdropFilter: theme.blur, WebkitBackdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.lg, padding: 4, marginBottom: 12 }}>
          {["posts","reels"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "9px", borderRadius: theme.radius.md,
              background: activeTab === tab ? c.bgGlassStrong : "transparent",
              border:     activeTab === tab ? `1px solid ${c.borderAccent}` : "1px solid transparent",
              color:      activeTab === tab ? c.primary : c.textMuted,
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize:   13, cursor: "pointer", transition: "opacity 0.15s",
              textTransform: "capitalize",
            }}>
              {tab} ({tab === "posts" ? posts.length : reels.length})
            </button>
          ))}
        </div>

        {/* Grid */}
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", background: c.bgGlass, backdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.xl }}>
              <p style={{ color: c.textMuted, fontWeight: 600 }}>No posts yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
              {posts.map(post => (
                <div key={post.id} onClick={() => setSelectedPost(post)} style={{ aspectRatio: "1/1", borderRadius: theme.radius.sm, overflow: "hidden", cursor: "pointer", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = "0"}
                >
                  <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0, transition: "opacity 0.2s" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {post.like_count || 0}</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {post.comment_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "reels" && (
          reels.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", background: c.bgGlass, backdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.xl }}>
              <p style={{ color: c.textMuted, fontWeight: 600 }}>No reels yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
              {reels.map(reel => (
                <ReelThumb key={reel.id} reel={reel} onClick={() => setSelectedReel(reel)} />
              ))}
            </div>
          )
        )}
      </main>

      <BottomNav />

      {/* Post Modal */}
      {selectedPost && (
        <div onClick={() => setSelectedPost(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: c.bgGlassStrong, backdropFilter: theme.blur, border: `1px solid ${c.border}`, borderRadius: theme.radius.xl, overflow: "hidden", maxWidth: 420, width: "100%", position: "relative" }}>
            <button onClick={() => setSelectedPost(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 1, background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.textPrimary} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <img src={selectedPost.image_url} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} alt="" />
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: c.textPrimary }}>{selectedPost.full_name}</p>
              <p style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }}>{selectedPost.caption}</p>
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12, color: c.textMuted, fontWeight: 600 }}>
                <span><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {selectedPost.like_count || 0}</span>
                <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {selectedPost.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reel Modal */}
      {selectedReel && (
        <div onClick={() => setSelectedReel(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 320, height: 560, borderRadius: theme.radius.xl, overflow: "hidden", position: "relative", background: "#000" }}>
            <video src={selectedReel.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay loop controls playsInline />
            <button onClick={() => setSelectedReel(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", backdropFilter: "none", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReelThumb({ reel, onClick }) {
  const videoRef = useRef(null)
  return (
    <div onClick={onClick} style={{ aspectRatio: "9/16", borderRadius: theme.radius.sm, overflow: "hidden", cursor: "pointer", position: "relative", background: "#000" }}
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }}
    >
      {reel.thumbnail_url
        ? <img src={reel.thumbnail_url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : null
      }
      <video ref={videoRef} src={reel.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" loop />
      <div style={{ position: "absolute", top: 6, left: 6, background: "var(--bg-overlay)", backdropFilter: "none", borderRadius: 6, padding: "2px 6px" }}>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>▶ {reel.views || 0}</span>
      </div>
    </div>
  )
}