// src/pages/UserProfile.jsx
import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import DesktopSidebar from "../components/DesktopSidebar"
import useIsMobile from "../hooks/useIsMobile"
import { useAuth } from "../hooks/useAuth.jsx"
import { supabase } from "../lib/supabase"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

export default function UserProfile() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const isMobile  = useIsMobile()

  const [profile, setProfile]         = useState(null)
  const [posts, setPosts]             = useState([])
  const [reels, setReels]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [following, setFollowing]     = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab]     = useState("posts")
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedReel, setSelectedReel] = useState(null)

  useEffect(() => {
    if (id === user?.id) { navigate("/profile", { replace: true }); return }
    fetchProfile()
  }, [id])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res  = await fetch(`${BASE}/users/${id}`, { headers: await authHeaders() })
      const data = await res.json()
      setProfile(data)
      setFollowing(data.is_following || false)
      const { data: userPosts } = await supabase.from("posts_with_meta").select("*").eq("user_id", id).order("created_at", { ascending: false })
      setPosts(userPosts || [])
      const { data: userReels } = await supabase.from("reels").select("*").eq("user_id", id).order("created_at", { ascending: false })
      setReels(userReels || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleFollow() {
    setFollowLoading(true)
    const res  = await fetch(`${BASE}/users/${id}/follow`, { method: "POST", headers: await authHeaders() })
    const data = await res.json()
    setFollowing(data.following)
    setProfile(p => ({ ...p, followers: data.following ? (p.followers||0)+1 : (p.followers||0)-1 }))
    setFollowLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `calc(${theme.navbar.height} + 20px) 20px`, display: "flex", gap: 24 }}>
          {!isMobile && <DesktopSidebar />}
          <div style={{ flex: 1 }}>
            <div style={{ background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 20, height: 200, animation: "slide-up 0.4s ease both" }} />
          </div>
        </div>
        {isMobile && <BottomNav />}
      </div>
    )
  }

  if (!profile || profile.error) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `calc(${theme.navbar.height} + 40px) 20px`, display: "flex", gap: 24 }}>
          {!isMobile && <DesktopSidebar />}
          <div style={{ flex: 1, textAlign: "center", padding: 40 }}>
            <p style={{ color: c.textMuted, fontWeight: 600 }}>User not found.</p>
          </div>
        </div>
        {isMobile && <BottomNav />}
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: `calc(${theme.navbar.height} + 20px) 20px calc(${theme.bottomNav.height} + 20px)`,
        display: "flex", gap: 24, alignItems: "flex-start",
      }}>
        {!isMobile && <DesktopSidebar />}

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Profile card */}
          <div style={{ background: "var(--bg-card)", backdropFilter: "none", WebkitBackdropFilter: "none", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 20px", marginBottom: 12, animation: "slide-up 0.35s ease both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>

              {/* Avatar */}
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 2.5, flexShrink: 0 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2.5px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: c.primary }}>
                  {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : profile.full_name?.charAt(0)}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.3px", marginBottom: 2 }}>{profile.full_name}</p>
                <p style={{ fontSize: 13, color: c.primary, fontWeight: 500, marginBottom: 6 }}>@{profile.username}</p>
                {profile.bio && <p style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{profile.bio}</p>}
                <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: c.textMuted, background: "rgba(99,102,241,0.06)", padding: "3px 10px", borderRadius: 20 }}>LPU Student</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={handleFollow} disabled={followLoading} style={{
                  padding: "9px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "opacity 0.15s",
                  background: following ? "var(--bg-nav)" : `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
                  border: following ? "1px solid rgba(99,102,241,0.20)" : "none",
                  color: following ? c.textPrimary : "#fff",
                  boxShadow: following ? "none" : theme.shadow.btn,
                  opacity: followLoading ? 0.6 : 1,
                }}>
                  {followLoading ? "..." : following ? "Following" : "+ Follow"}
                </button>
                <button onClick={() => navigate("/messages", { state: { openChat: { partner_id: id, full_name: profile.full_name, username: profile.username, avatar_url: profile.avatar_url } } })}
                  style={{ padding: "9px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer", background: "var(--bg-nav)", border: "1px solid rgba(99,102,241,0.20)", color: c.textPrimary }}>
                  Message
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(99,102,241,0.08)", marginTop: 20, paddingTop: 16 }}>
              {[
                { label: "Posts",     val: posts.length },
                { label: "Reels",     val: reels.length },
                { label: "Followers", val: profile.followers || 0 },
                { label: "Following", val: profile.following || 0 },
              ].map((s, i, arr) => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < arr.length-1 ? "1px solid rgba(99,102,241,0.08)" : "none" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, letterSpacing: "-0.5px" }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: c.textMuted, fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 14, padding: 4, marginBottom: 12 }}>
            {["posts","reels"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "9px", borderRadius: 10, fontWeight: activeTab === tab ? 700 : 400, fontSize: 13, cursor: "pointer", transition: "opacity 0.15s", textTransform: "capitalize",
                background: activeTab === tab ? "var(--bg-card)" : "transparent",
                border: activeTab === tab ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent",
                color: activeTab === tab ? c.primary : c.textMuted,
              }}>
                {tab} ({tab === "posts" ? posts.length : reels.length})
              </button>
            ))}
          </div>

          {/* Posts grid */}
          {activeTab === "posts" && (
            posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 16 }}>
                <p style={{ color: c.textMuted, fontWeight: 600 }}>No posts yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                {posts.map(post => (
                  <div key={post.id} onClick={() => setSelectedPost(post)} style={{ aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", cursor: "pointer", position: "relative" }}
                    onMouseEnter={e => e.currentTarget.querySelector(".ov").style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.querySelector(".ov").style.opacity = "0"}
                  >
                    <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    <div className="ov" style={{ position: "absolute", inset: 0, background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0, transition: "opacity 0.2s" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {post.like_count || 0}</span>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {post.comment_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Reels grid */}
          {activeTab === "reels" && (
            reels.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", backdropFilter: "none", border: "1px solid var(--border)", borderRadius: 16 }}>
                <p style={{ color: c.textMuted, fontWeight: 600 }}>No reels yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                {reels.map(reel => (
                  <ReelThumb key={reel.id} reel={reel} onClick={() => setSelectedReel(reel)} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {isMobile && <BottomNav />}

      {/* Post modal */}
      {selectedPost && (
        <div onClick={() => setSelectedPost(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg-overlay)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 20, overflow: "hidden", maxWidth: 420, width: "100%", position: "relative" }}>
            <button onClick={() => setSelectedPost(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 1, background: "rgba(0,0,0,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

      {/* Reel modal */}
      {selectedReel && (
        <div onClick={() => setSelectedReel(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 320, height: 560, borderRadius: 20, overflow: "hidden", position: "relative", background: "#000" }}>
            <video src={selectedReel.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay loop controls playsInline />
            <button onClick={() => setSelectedReel(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
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
    <div onClick={onClick} style={{ aspectRatio: "9/16", borderRadius: 8, overflow: "hidden", cursor: "pointer", position: "relative", background: "#000" }}
      onMouseEnter={() => videoRef.current?.play().catch(() => {})}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 } }}
    >
      {reel.thumbnail_url && <img src={reel.thumbnail_url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
      <video ref={videoRef} src={reel.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" loop />
      <div style={{ position: "absolute", top: 6, left: 6, background: "var(--bg-overlay)", borderRadius: 6, padding: "2px 6px" }}>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>▶ {reel.views || 0}</span>
      </div>
    </div>
  )
}