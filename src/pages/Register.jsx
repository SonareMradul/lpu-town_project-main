// src/pages/Register.jsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.jsx"
import theme from "../theme"

const c = theme.colors


export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ fullName: "", regNumber: "", email: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (!form.email.endsWith("@lpu.in")) { setError("Only @lpu.in email addresses are allowed."); return }
    if (form.password.length < 8)        { setError("Password must be at least 8 characters."); return }
    setLoading(true)
    const { error: err } = await register(form)
    setLoading(false)
    if (err) setError(err.message)
    else navigate("/login?registered=1")
  }

  return (
    <div style={{
      minHeight: "100vh", background: c.bgPage,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", bottom: -60, left: -40, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: theme.shadow.btn }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>L</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary }}>LPU<span style={{ color: c.primary }}>Town</span></h1>
          <p style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>Join the student network</p>
        </div>

        <div style={{
          background: c.bgGlass, backdropFilter: theme.blur, WebkitBackdropFilter: theme.blur,
          border: `1px solid ${c.border}`, borderRadius: theme.radius.xl,
          padding: "28px 24px", boxShadow: theme.shadow.card,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: c.textPrimary, marginBottom: 20 }}>Create your account</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Full Name" type="text" placeholder="Yash Sharma" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
            <Field label="Registration Number" type="text" placeholder="1220XXXX" value={form.regNumber} onChange={v => setForm(f => ({ ...f, regNumber: v }))} />
            <Field label="LPU Email" type="email" placeholder="yash@lpu.in" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Field label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />

            {error && <p style={{ fontSize: 12, color: c.error, fontWeight: 500 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              background: `linear-gradient(135deg, ${c.gradientA}, ${c.gradientB})`,
              color: "#fff", border: "none", borderRadius: theme.radius.md,
              padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: theme.shadow.btn, opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: c.textMuted, marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: c.primary, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary, display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} required
        style={{
          width: "100%", background: c.bgInput,
          border: `1px solid ${focused ? c.borderAccent : c.border}`,
          borderRadius: theme.radius.md, padding: "11px 14px",
          fontSize: 14, color: c.textPrimary, outline: "none", transition: "opacity 0.15s",
          boxShadow: focused ? `0 0 0 3px ${c.primaryGlow}` : "none",
        }}
      />
    </div>
  )
}