// src/pages/Home.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import DesktopSidebar from "../components/DesktopSidebar"
import PostCard from "../components/PostCard"
import Stories from "../components/Stories"
import { getPosts } from "../lib/api"
import useIsMobile from "../hooks/useIsMobile"
import theme from "../theme"

const c = theme.colors

export default function Home() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => { fetchPosts() }, [page])

  async function fetchPosts() {
    setLoading(true)
    const data = await getPosts(page)
    const arr  = Array.isArray(data) ? data : []
    setPosts(prev => page === 1 ? arr : [...prev, ...arr])
    if (arr.length < 10) setHasMore(false)
    setLoading(false)
  }

  const feed = (
    <div style={{ width: "100%" }}>
      <Stories />
      {loading && page === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1,2].map(i => (
            <div key={i} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
                <div style={{ width: 120, height: 12, background: "rgba(99,102,241,0.08)", borderRadius: 6 }} />
              </div>
              <div style={{ aspectRatio: "1/1", background: "rgba(99,102,241,0.05)" }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 20 }}>
          <p style={{ fontWeight: 700, color: c.textPrimary, marginBottom: 6 }}>No posts yet</p>
          <button onClick={() => navigate("/upload")} style={{ background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: theme.shadow.btn }}>
            Share a Post
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              userId={post.user_id}
              name={post.full_name}
              username={post.username}
              caption={post.caption}
              image={post.image_url}
              likes={post.like_count}
              comments={post.comment_count}
              avatar={post.avatar_url}
              createdAt={post.created_at}
              onDelete={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
            />
          ))}
          {hasMore && (
            <button onClick={() => setPage(p => p + 1)} disabled={loading}
              style={{ width: "100%", padding: 14, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 16, color: c.textMuted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      {isMobile ? (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", padding: `calc(${theme.navbar.height} + 12px) 12px calc(${theme.bottomNav.height} + 16px)` }}>
            {feed}
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: `calc(${theme.navbar.height} + 20px) 20px 40px`, display: "flex", gap: 24, alignItems: "flex-start" }}>
            <DesktopSidebar />
            <div style={{ flex: 1, maxWidth: 600 }}>{feed}</div>
            <div style={{ width: 260, flexShrink: 0, position: "sticky", top: `calc(${theme.navbar.height} + 20px)` }}>
              <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Suggested</p>
                {[41,42,43,44,45].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <img src={`https://i.pravatar.cc/64?u=${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: c.textPrimary }}>student_{i-40}</p>
                      <p style={{ fontSize: 11, color: c.textMuted }}>Suggested</p>
                    </div>
                    <button onClick={() => navigate("/search")} style={{ background: "none", border: "none", color: c.primary, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Follow</button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: c.textMuted, marginTop: 16, lineHeight: 1.8 }}>
                LPU Town · For Vertos, By Vertos<br/>© 2025
              </p>
            </div>
          </div>
        </div>
      )}
      {isMobile && <BottomNav />}
    </div>
  )
}