// src/pages/Upload.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageLayout from "../components/PageLayout"
import { uploadImage, createPost } from "../lib/api"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors


export default function Upload() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file)    return setError("Please select an image first.")
    if (!caption.trim()) return setError("Please add a caption.")
    setLoading(true); setError("")
    try {
      const image_url = await uploadImage("posts", file, user.id)
      await createPost(caption, image_url)
      navigate("/home")
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout maxWidth={520}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: c.textPrimary, marginBottom: 20, letterSpacing: "-0.3px" }}>
        Share a post
      </h2>

      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "none", WebkitBackdropFilter: "none",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: "24px 20px",
      }}>
        {/* Image picker */}
        <label style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          width: "100%", aspectRatio: "1/1", maxHeight: 360,
          background: preview ? "transparent" : "rgba(99,102,241,0.04)",
          border: `1.5px dashed ${preview ? "transparent" : "rgba(99,102,241,0.25)"}`,
          borderRadius: 16, cursor: "pointer",
          overflow: "hidden", marginBottom: 16, transition: "opacity 0.15s",
        }}>
          {preview ? (
            <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="preview" />
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>Select a photo</p>
              <p style={{ fontSize: 12, color: c.textMuted }}>JPG, PNG, GIF supported</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        {preview && (
          <label style={{ display: "block", textAlign: "center", marginBottom: 16, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: c.primary, fontWeight: 600 }}>Change photo</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        )}

        {/* Caption */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 6 }}>Caption</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's happening at LPU?"
            style={{
              width: "100%", background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14, padding: "12px 14px",
              fontSize: 14, color: c.textPrimary, outline: "none",
              resize: "none", height: 100, fontFamily: "inherit",
              transition: "border 0.18s",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.30)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)" }}
            onBlur={e => { e.target.style.borderColor = "var(--bg-card)"; e.target.style.boxShadow = "none" }}
          />
        </div>

        {error && <p style={{ fontSize: 13, color: c.error, marginBottom: 14, fontWeight: 500 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1,
            background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
            color: "#fff", border: "none", borderRadius: 14,
            padding: "12px", fontWeight: 700, fontSize: 14,
            cursor: "pointer", boxShadow: theme.shadow.btn,
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
          }}>
            {loading ? "Uploading..." : "Share Post"}
          </button>
          <button onClick={() => navigate(-1)} style={{
            background: "var(--bg-nav)",
            border: "1px solid rgba(99,102,241,0.15)",
            color: c.textSecondary, borderRadius: 14,
            padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>
    </PageLayout>
  )
}