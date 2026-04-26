// src/components/Stories.jsx
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../hooks/useAuth.jsx"
import { supabase } from "../lib/supabase"
import { uploadImage } from "../lib/api"
import theme from "../theme"

const c = theme.colors

const BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:4000/api"

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }
}

export default function Stories() {
  const { user, profile } = useAuth()
  const [groups, setGroups]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [viewer, setViewer]       = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => { fetchStories() }, [])

  async function fetchStories() {
    try {
      const res  = await fetch(`${BASE}/stories`, { headers: await authHeaders() })
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch { setGroups([]) }
    finally { setLoading(false) }
  }

  async function markViewed(storyId) {
    await fetch(`${BASE}/stories/${storyId}/view`, { method: "POST", headers: await authHeaders() })
  }

  function openViewer(groupIdx, storyIdx = 0) {
    setViewer({ groupIdx, storyIdx })
    const story = groups[groupIdx]?.stories[storyIdx]
    if (story) markViewed(story.id)
  }

  function nextStory() {
    if (!viewer) return
    const group = groups[viewer.groupIdx]
    if (viewer.storyIdx < group.stories.length - 1) {
      const next = viewer.storyIdx + 1
      setViewer({ ...viewer, storyIdx: next })
      markViewed(group.stories[next].id)
    } else if (viewer.groupIdx < groups.length - 1) {
      openViewer(viewer.groupIdx + 1, 0)
    } else {
      setViewer(null)
    }
  }

  function prevStory() {
    if (!viewer) return
    if (viewer.storyIdx > 0) {
      setViewer({ ...viewer, storyIdx: viewer.storyIdx - 1 })
    } else if (viewer.groupIdx > 0) {
      const prevGroup = groups[viewer.groupIdx - 1]
      setViewer({ groupIdx: viewer.groupIdx - 1, storyIdx: prevGroup.stories.length - 1 })
    }
  }

  const activeStory = viewer !== null ? groups[viewer.groupIdx]?.stories[viewer.storyIdx] : null
  const activeGroup = viewer !== null ? groups[viewer.groupIdx] : null

  // Short display name — first name only
  function shortName(name) {
    if (!name) return ""
    return name.split(" ")[0]
  }

  return (
    <>
      <div style={{
        background: "var(--bg-card)", backdropFilter: "none",
        WebkitBackdropFilter: "none", border: "1px solid var(--border)",
        borderRadius: 16, padding: "12px 14px", marginBottom: 14,
      }}>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none" }}>

          {/* Add story button */}
          <div onClick={() => setShowCreate(true)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }}
          >
            <div style={{ position: "relative", width: 52, height: 52 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 2 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2.5px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: c.primary }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : profile?.full_name?.charAt(0) || "Y"
                  }
                </div>
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: "50%", background: c.primary, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </div>
            <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 500 }}>Add</span>
          </div>

          {/* Story groups */}
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }} />
                <div style={{ width: 32, height: 8, background: "rgba(99,102,241,0.08)", borderRadius: 4 }} />
              </div>
            ))
          ) : groups.map((group, idx) => (
            <div key={group.user_id} onClick={() => openViewer(idx)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: "50%", padding: 2.5,
                background: group.has_unseen
                  ? `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB}, ${c.gradientC})`
                  : "rgba(180,180,180,0.5)",
              }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2.5px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: c.primary }}>
                  {group.avatar_url
                    ? <img src={group.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : group.full_name?.charAt(0)
                  }
                </div>
              </div>
              {/* Show first name, not username */}
              <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 500, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                {group.user_id === user?.id ? "You" : shortName(group.full_name)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create story modal */}
      {showCreate && (
        <CreateStoryModal
          user={user}
          profile={profile}
          onClose={() => setShowCreate(false)}
          onSuccess={async () => {
            setShowCreate(false)
            await fetchStories()
          }}
        />
      )}

      {/* Story viewer */}
      {viewer !== null && activeStory && (
        <StoryViewer
          group={activeGroup}
          story={activeStory}
          storyIdx={viewer.storyIdx}
          totalStories={activeGroup.stories.length}
          onNext={nextStory}
          onPrev={prevStory}
          onClose={() => setViewer(null)}
          user={user}
          onDelete={async () => {
            await fetch(`${BASE}/stories/${activeStory.id}`, { method: "DELETE", headers: await authHeaders() })
            await fetchStories()
            setViewer(null)
          }}
        />
      )}

      <style>{`
        @keyframes story-progress { from { width: 0% } to { width: 100% } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}

// ── Create Story Modal ─────────────────────────
function CreateStoryModal({ user, profile, onClose, onSuccess }) {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [caption, setCaption]   = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState("")
  const fileRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 30 * 1024 * 1024) { setError("Max 30MB"); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError("")
  }

  async function handleUpload() {
    if (!file) return setError("Select a photo or video first.")
    setUploading(true); setError("")
    try {
      const media_url  = await uploadImage("stories", file, user.id)
      const media_type = file.type.startsWith("video") ? "video" : "image"
      const res  = await fetch(`${BASE}/stories`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ media_url, media_type, caption: caption.trim() || null })
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      onSuccess()
    } catch (err) { setError(err.message || "Upload failed.") }
    finally { setUploading(false) }
  }

  const isVideo = file?.type?.startsWith("video")

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg-overlay)", backdropFilter: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--bg-elevated)", borderRadius: 24, padding: "22px 20px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, padding: 2 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid white", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c.primary }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : profile?.full_name?.charAt(0)
                }
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{profile?.full_name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Your story · 24h</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Media picker */}
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          width: "100%", aspectRatio: preview ? (isVideo ? "9/16" : "1/1") : "4/3",
          maxHeight: 320,
          background: preview ? "transparent" : "rgba(99,102,241,0.04)",
          border: `1.5px dashed ${preview ? "transparent" : "rgba(99,102,241,0.25)"}`,
          borderRadius: 16, cursor: "pointer", overflow: "hidden", marginBottom: 14,
        }}>
          {preview ? (
            isVideo
              ? <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline autoPlay loop />
              : <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>Select photo or video</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Disappears after 24 hours</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
        </label>

        {/* Change media button if already selected */}
        {preview && (
          <label style={{ display: "block", textAlign: "center", marginBottom: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 12, color: c.primary, fontWeight: 600 }}>Change photo/video</span>
            <input type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
          </label>
        )}

        {/* Caption input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Caption <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={150}
            style={{
              width: "100%", background: "var(--bg-input)",
              border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12,
              padding: "10px 14px", fontSize: 14, color: "var(--text-primary)",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
            onFocus={e => e.target.style.borderColor = c.primary}
            onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.15)"}
          />
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>{caption.length}/150</p>
        </div>

        {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12, fontWeight: 500 }}>{error}</p>}

        <button onClick={handleUpload} disabled={uploading || !file} style={{
          width: "100%",
          background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
          color: "#fff", border: "none", borderRadius: 14,
          padding: "13px", fontWeight: 700, fontSize: 14,
          cursor: "pointer", boxShadow: theme.shadow.btn,
          opacity: (uploading || !file) ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {uploading ? (
            <>
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Uploading...
            </>
          ) : "Share Story"}
        </button>
      </div>
    </div>
  )
}

// ── Story Viewer ───────────────────────────────
function StoryViewer({ group, story, storyIdx, totalStories, onNext, onPrev, onClose, user, onDelete }) {
  const isOwner = story.user_id === user?.id

  useEffect(() => {
    const timer = setTimeout(() => onNext(), 5000)
    return () => clearTimeout(timer)
  }, [story.id])

  const hoursLeft = Math.ceil((new Date(story.expires_at) - Date.now()) / 3600000)

  useEffect(() => {
    document.body.classList.add("story-open")
    return () => {
      document.body.classList.remove("story-open")
    }
  }, [])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Progress bars */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 4, zIndex: 10 }}>
        {Array.from({ length: totalStories }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2.5, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "var(--bg-elevated)", borderRadius: 2,
              width:     i < storyIdx  ? "100%" : "0%",
              animation: i === storyIdx ? "story-progress 5s linear forwards" : "none",
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ position: "absolute", top: 26, left: 12, right: 12, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "2px solid white", flexShrink: 0, background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
          {group.avatar_url
            ? <img src={group.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            : group.full_name?.charAt(0)
          }
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{group.full_name}</p>
          <p style={{ color: "var(--bg-card)", fontSize: 11 }}>{hoursLeft}h remaining</p>
        </div>
        {isOwner && (
          <button onClick={onDelete} style={{ background: "rgba(239,68,68,0.25)", border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 4 }}>
            Delete
          </button>
        )}
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Media */}
      <div style={{ width: "100%", maxWidth: 420, height: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {story.media_type === "video" ? (
          <video src={story.media_url} style={{ width: "100%", height: "100%", objectFit: "contain" }} autoPlay muted playsInline />
        ) : (
          <img src={story.media_url} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="" />
        )}
      </div>

      {/* Caption */}
      {story.caption && (
        <div style={{ position: "absolute", bottom: 50, left: 16, right: 16, background: "var(--bg-overlay)", backdropFilter: "none", borderRadius: 14, padding: "10px 14px", zIndex: 10 }}>
          <p style={{ color: "#fff", fontSize: 14, lineHeight: 1.5 }}>{story.caption}</p>
        </div>
      )}

      {/* Tap zones */}
      <div onClick={onPrev} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "33%", zIndex: 5, cursor: "pointer" }} />
      <div onClick={onNext} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "33%", zIndex: 5, cursor: "pointer" }} />
    </div>
  )
}