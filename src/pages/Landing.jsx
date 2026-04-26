// src/pages/Landing.jsx
import { useNavigate } from "react-router-dom"
import theme from "../theme"

const c = theme.colors

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif", overflowX:"hidden" }}>
      <style>{`
        @keyframes wave{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.4);opacity:0}}
        @keyframes float-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradient-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse-dot{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2);opacity:0}}
        @keyframes card-float-1{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(-3deg)}}
        @keyframes card-float-2{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes card-float-3{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(-2deg)}}
        @keyframes card-float-4{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
        @keyframes card-float-5{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-9px) rotate(-1deg)}}
        @keyframes phone-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes blob-morph{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
        .grad-text{background:linear-gradient(135deg,${c.gradientA},${c.gradientB},${c.gradientC});background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradient-shift 4s ease infinite}
        .notif-card{position:absolute;background:rgba(255,255,255,0.97);border:1px solid rgba(200,200,220,0.50);border-radius:16px;padding:10px 13px;display:flex;align-items:center;gap:9px;box-shadow:0 8px 24px rgba(99,102,241,0.10);cursor:pointer;transition:transform 0.25s,box-shadow 0.25s,border-color 0.25s;z-index:6;min-width:155px}
        .notif-card:hover{box-shadow:0 20px 44px rgba(99,102,241,0.25)!important;border-color:rgba(99,102,241,0.35)!important;z-index:10}
        .notif-card:hover .c-icon{transform:scale(1.15) rotate(-5deg)}
        .c-icon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;font-weight:800;color:#fff;transition:transform 0.25s;position:relative}
        .c-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:#10b981;border:2px solid #fff}
        .c-title{font-size:12px;font-weight:700;color:#111827;line-height:1.3}
        .c-sub{font-size:10px;color:#9ca3af;margin-top:1px}
        .c-tag{font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;margin-top:3px;width:fit-content}
        .phone-wrap{width:220px;background:#fff;border-radius:34px;border:7px solid #e5e7eb;box-shadow:0 30px 70px rgba(99,102,241,0.18);overflow:hidden;z-index:5;animation:phone-float 4s ease-in-out infinite;flex-shrink:0;transition:box-shadow 0.3s}
        
        .feature-card-land{background:rgba(255,255,255,0.95);border:1px solid rgba(200,200,220,0.40);border-radius:20px;padding:24px;transition:all 0.2s;cursor:default}
        .feature-card-land:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(99,102,241,0.12)}
        .comm-card{background:rgba(255,255,255,0.95);border:1px solid rgba(200,200,220,0.40);border-radius:16px;padding:16px 18px;min-width:160px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;transition:all 0.2s;cursor:pointer}
        .comm-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(99,102,241,0.12)}
        .stat-pill{flex:1;text-align:center;padding:16px 12px;background:rgba(255,255,255,0.90);border:1px solid rgba(200,200,220,0.40);transition:all 0.2s}
        .stat-pill:hover{background:#fff;transform:translateY(-2px);box-shadow:0 8px 20px rgba(99,102,241,0.12);z-index:1;position:relative}
        .btn-land-primary{padding:14px 32px;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,${c.gradientA},${c.gradientB});color:#fff;border:none;box-shadow:0 8px 24px rgba(99,102,241,0.35);transition:all 0.2s;font-family:inherit}
        .btn-land-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(99,102,241,0.50)}
        .btn-land-ghost{padding:14px 32px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;background:rgba(255,255,255,0.90);border:1px solid rgba(99,102,241,0.20);color:#374151;transition:all 0.2s;font-family:inherit}
        .btn-land-ghost:hover{border-color:${c.primary};color:${c.primary};transform:translateY(-1px)}
        .wave-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(99,102,241,0.30);animation:wave 4s ease-out infinite;pointer-events:none;top:50%;left:50%;display:var(--wave-display,block)}
        .logo-btn:hover{transform:scale(1.1) rotate(-5deg);box-shadow:0 8px 20px rgba(99,102,241,0.5)!important}
        @media(max-width:768px){
          .notif-card{display:none!important}
          .mobile-notif{display:flex!important}
          .wave-ring{display:none!important}
          .phone-wrap{animation:none!important}
          .feature-card-land:hover{transform:none!important;box-shadow:none!important}
        }
        @media(min-width:769px){.mobile-notif{display:none!important}}
        .mobile-notif{position:absolute;background:rgba(255,255,255,0.97);border:1px solid rgba(200,200,220,0.50);border-radius:12px;padding:8px 11px;align-items:center;gap:8px;box-shadow:0 6px 18px rgba(99,102,241,0.12);z-index:8;max-width:160px;display:none}
      `}</style>

      {/* NAV */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.80)", borderBottom:"1px solid rgba(255,255,255,0.90)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div className="logo-btn" style={{ width:30, height:30, borderRadius:9, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", boxShadow:`0 4px 12px rgba(99,102,241,0.35)`, cursor:"pointer", transition:"all 0.2s" }}>L</div>
          <span style={{ fontSize:16, fontWeight:800, color:"#111827", letterSpacing:"-0.4px", marginLeft:2 }}>LPU<span style={{ color:c.primary }}>Town</span></span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => navigate("/login")} style={{ padding:"8px 18px", borderRadius:10, border:"1px solid rgba(99,102,241,0.25)", background:"rgba(255,255,255,0.90)", color:c.primary, fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.90)"; e.currentTarget.style.transform = "translateY(0)" }}>
            Sign In
          </button>
          <button onClick={() => navigate("/register")} style={{ padding:"8px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit", boxShadow:`0 4px 14px rgba(99,102,241,0.35)` }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)" }}>
            Join Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative", padding:"50px 20px 60px", overflow:"hidden", background:"linear-gradient(160deg,#f0f4ff 0%,#faf0ff 50%,#f0fff8 100%)" }}>

        {/* Blobs */}
        {[
          { size:380, color:c.gradientA, top:-120, left:-100, delay:0 },
          { size:300, color:c.gradientC, bottom:-80, right:-80, delay:5 },
          { size:220, color:"#10b981",   top:"35%", left:"35%", delay:8, opacity:0.12 },
        ].map((b,i) => (
          <div key={i} style={{ position:"absolute", width:b.size, height:b.size, borderRadius:"50%", filter:"blur(60px)", opacity:b.opacity||0.20, pointerEvents:"none", background:b.color, top:b.top, left:b.left, bottom:b.bottom, right:b.right, animation:"none" }} />
        ))}

        {/* Wave rings */}
        {[160,280,420,580,760].map((size,i) => (
          <div key={i} className="wave-ring" style={{ width:size, height:size, marginLeft:-size/2, marginTop:-size/2, animationDelay:`${i*0.8}s`, borderColor: i>2 ? `rgba(99,102,241,${0.15-i*0.03})` : "rgba(99,102,241,0.30)" }} />
        ))}

        {/* Hero text */}
        <div style={{ textAlign:"center", position:"relative", zIndex:3, animation:"float-up 0.7s ease both" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)", borderRadius:20, padding:"6px 16px", marginBottom:22 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:c.primary, position:"relative" }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:c.primary, animation:"pulse-dot 1.5s ease-out infinite" }} />
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:c.primary }}>Exclusive to LPU students · @lpu.in only</span>
          </div>

          <h1 style={{ fontSize:"clamp(32px,5.5vw,58px)", fontWeight:900, color:"#111827", letterSpacing:"-2px", lineHeight:1.05, marginBottom:18 }}>
            Beyond UMS.<br/>
            <span className="grad-text">Connect. Create. Thrive.</span>
          </h1>
          <p style={{ fontSize:16, color:"#6b7280", maxWidth:460, margin:"0 auto 32px", lineHeight:1.7 }}>
            The official student network for LPU — share reels, join communities, find hackathon teammates.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-land-primary" onClick={() => navigate("/register")}>Join the Tribe</button>
            <button className="btn-land-ghost" onClick={() => navigate("/login")}>Sign In</button>
          </div>
        </div>

        {/* Scene */}
        <div style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center", marginTop:40, height:"auto", minHeight:320 }}>

          {/* LEFT cards */}
          <NotifCard style={{ top:20, left:"calc(50% - 350px)", animation:"card-float-1 3.8s ease-in-out infinite" }}
            icon="🎯" iconBg="linear-gradient(135deg,#f59e0b,#ef4444)" showOnline
            title="Makeathon 8.0" sub="Registrations open!" tag="⚡ Hackathon" tagBg="rgba(245,158,11,0.12)" tagColor="#d97706" badge="3" badgeBg="linear-gradient(135deg,#ef4444,#f43f5e)" />

          <NotifCard style={{ top:155, left:"calc(50% - 390px)", animation:"card-float-2 4.2s ease-in-out infinite 0.5s" }}
            icon="S" iconBg={`linear-gradient(135deg,${c.gradientA},${c.gradientB})`} showOnline
            title="Sushil Swain" sub="Joined LPU Coders" tag="💻 Community" tagBg="rgba(99,102,241,0.10)" tagColor={c.primary} />

          <NotifCard style={{ top:295, left:"calc(50% - 350px)", animation:"card-float-3 3.5s ease-in-out infinite 1s" }}
            icon="A" iconBg="linear-gradient(135deg,#ec4899,#f43f5e)"
            title="Akshit R." sub="Need MERN dev for..." tag="💬 Message" tagBg="rgba(236,72,153,0.10)" tagColor="#db2777" />

          {/* Phone */}
          <div className="phone-wrap">
            <div style={{ height:22, background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid #f3f4f6" }}>
              <div style={{ width:50, height:4, background:"#e5e7eb", borderRadius:2 }} />
            </div>
            <div style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, padding:"9px 11px", display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:20, height:20, borderRadius:6, background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>L</div>
              <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>LPUTown</span>
            </div>
            <div style={{ padding:7, background:"#f9fafb" }}>
              {/* Stories */}
              <div style={{ background:"#fff", borderRadius:8, padding:"6px 8px", marginBottom:7, display:"flex", gap:8, overflow:"hidden" }}>
                {[{l:"Y",g:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`,bg:"#f5f3ff",t:c.primary,n:"You"},{l:"R",g:"linear-gradient(135deg,#ec4899,#f59e0b)",bg:"#fce7f3",t:"#ec4899",n:"Akshit"},{l:"A",g:"linear-gradient(135deg,#10b981,#3b82f6)",bg:"#ecfdf5",t:"#059669",n:"Chhavi"},{l:"K",g:"linear-gradient(135deg,#f59e0b,#ef4444)",bg:"#fff7ed",t:"#d97706",n:"Tanisha🌸"}].map((s,i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:s.g, padding:2 }}>
                      <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:s.bg, border:"1.5px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:s.t }}>{s.l}</div>
                    </div>
                    <span style={{ fontSize:6, color:"#9ca3af" }}>{s.n}</span>
                  </div>
                ))}
              </div>
              {/* Post */}
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", marginBottom:6 }}>
                <div style={{ padding:"6px 8px", display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, padding:1.5, flexShrink:0 }}>
                    <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:6, fontWeight:700, color:c.primary, border:"1px solid #fff" }}>R</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, color:"#111827" }}>Yash Hayaran</div>
                    <div style={{ fontSize:7, color:"#9ca3af" }}>2h ago</div>
                  </div>
                </div>
                <div style={{ height:85, background:`linear-gradient(135deg,${c.gradientA}cc,${c.gradientB}cc)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.6)"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div style={{ padding:"5px 8px", display:"flex", gap:6, alignItems:"center", fontSize:7, fontWeight:700, color:"#111827" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#e11d48"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  248 likes
                </div>
              </div>
              {/* Reel */}
              <div style={{ background:"#fff", borderRadius:8, overflow:"hidden", display:"flex" }}>
                <div style={{ width:44, background:"linear-gradient(180deg,#1a1a2e,#16213e)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style={{ padding:"6px 8px", flex:1 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#111827", marginBottom:2 }}>Campus Reel</div>
                  <div style={{ fontSize:7, color:"#9ca3af" }}>Makeathon highlights</div>
                  <span style={{ fontSize:7, color:c.primary, fontWeight:700, background:"rgba(99,102,241,0.10)", padding:"2px 5px", borderRadius:4, marginTop:4, display:"inline-block" }}>1.2k views</span>
                </div>
              </div>
            </div>
            {/* Bottom nav */}
            <div style={{ display:"flex", justifyContent:"space-around", padding:"6px 0", borderTop:"1px solid #f3f4f6", background:"#fff" }}>
              {[
                { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill={c.primary}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>, label:"Home", active:true },
                { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label:"Search" },
                { icon:<div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, display:"flex", alignItems:"center", justifyContent:"center" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div> },
                { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>, label:"Reels" },
                { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Profile" },
              ].map((item,i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                  {item.icon}
                  {item.label && <span style={{ fontSize:6, color:item.active ? c.primary : "#9ca3af", fontWeight:item.active ? 700 : 400 }}>{item.label}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile mini cards - overlay on phone */}
          <div className="mobile-notif" style={{ top:-10, right:-8, animation:"card-float-4 4s ease-in-out infinite" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0 }}>🎯</div>
            <div><div style={{ fontSize:11,fontWeight:700,color:"#111827",lineHeight:1.2 }}>Makeathon 8.0</div><div style={{ fontSize:9,color:"#9ca3af" }}>Open!</div></div>
          </div>
          <div className="mobile-notif" style={{ bottom:60, right:-12, animation:"card-float-2 3.8s ease-in-out infinite 0.8s" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0 }}>K</div>
            <div><div style={{ fontSize:11,fontWeight:700,color:"#111827" }}>Sushil Swain.</div><div style={{ fontSize:9,color:"#9ca3af" }}>Liked your post ❤️</div></div>
          </div>
          <div className="mobile-notif" style={{ bottom:150, left:-12, animation:"card-float-3 4.2s ease-in-out infinite 0.4s" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0 }}>S</div>
            <div><div style={{ fontSize:11,fontWeight:700,color:"#111827" }}>Mradul Sonare.</div><div style={{ fontSize:9,color:"#9ca3af" }}>Started following 👥</div></div>
          </div>
          <div className="mobile-notif" style={{ top:80, left:-10, animation:"card-float-1 3.5s ease-in-out infinite 1s" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#ec4899,#f43f5e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0 }}>🎬</div>
            <div><div style={{ fontSize:11,fontWeight:700,color:"#111827" }}>Your Reel</div><div style={{ fontSize:9,color:"#9ca3af" }}>1.2k views 🔥</div></div>
          </div>

          {/* RIGHT cards */}
          <NotifCard style={{ top:20, left:"calc(50% + 120px)", animation:"card-float-4 4s ease-in-out infinite 0.3s" }}
            icon="Y" iconBg="linear-gradient(135deg,#10b981,#3b82f6)" showOnline
            title="Yash H." sub="Liked your post"
            extra={<div style={{ display:"flex", gap:3, alignItems:"center", marginTop:4 }}>
              {[0,1,2].map(i => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#e11d48"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
              <span style={{ fontSize:9, color:"#9ca3af" }}>+48</span>
            </div>} />

          <NotifCard style={{ top:155, left:"calc(50% + 120px)", animation:"card-float-5 3.6s ease-in-out infinite 1.2s" }}
            icon="🎬" iconBg="linear-gradient(135deg,#ec4899,#f59e0b)"
            title="Your Reel" sub="1.2k views · trending" tag="🔥 Trending" tagBg="rgba(236,72,153,0.10)" tagColor="#db2777" />

          <NotifCard style={{ top:295, left:"calc(50% + 120px)", animation:"card-float-1 4.4s ease-in-out infinite 0.7s" }}
            icon="M" iconBg="linear-gradient(135deg,#8b5cf6,#ec4899)" showOnline
            title="Mradul Sonare." sub="Started following you" tag="👥 Follow" tagBg="rgba(139,92,246,0.10)" tagColor="#7c3aed" />

        </div>
      </section>

      {/* STATS */}
      <div style={{ padding:"0 24px 60px", background:"linear-gradient(160deg,#f0f4ff 0%,#faf0ff 50%,#f0fff8 100%)" }}>
        <div style={{ display:"flex", maxWidth:600, margin:"0 auto" }}>
          {[{num:"10K+",label:"Vertos"},{num:"50K+",label:"Posts shared"},{num:"200+",label:"Events hosted"}].map((s,i) => (
            <div key={i} className="stat-pill" style={{ borderRadius: i===0?"16px 0 0 16px":i===2?"0 16px 16px 0":"0", borderRight:i<2?"none":undefined }}>
              <div style={{ fontSize:22, fontWeight:900, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"-1px" }}>{s.num}</div>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:500, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding:"60px 24px", background:"#fff" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ display:"inline-block", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700, color:c.primary, marginBottom:14 }}>Everything you need</div>
            <h2 style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:900, color:"#111827", letterSpacing:"-1px", marginBottom:10 }}>Built for campus life</h2>
            <p style={{ fontSize:15, color:"#6b7280", maxWidth:480, margin:"0 auto", lineHeight:1.6 }}>From sharing your hackathon win to finding study partners — all in one place.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
            {[
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, bg:"rgba(99,102,241,0.09)", title:"Share Moments", desc:"Post photos, share 24hr stories, and show off your campus life." },
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, bg:"rgba(236,72,153,0.09)", title:"Campus Reels", desc:"Drop short videos — Block 13 sunsets, hackathon nights, tech tutorials." },
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg:"rgba(16,185,129,0.09)", title:"Host Events", desc:"Create hackathons, workshops, fests. Students register from the app." },
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg:"rgba(245,158,11,0.09)", title:"Communities", desc:"Reddit-style communities — LPU Coders, Campus Life, Startups." },
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, bg:"rgba(99,102,241,0.09)", title:"Direct Messages", desc:"Real-time chats. Find your hackathon partner, connect with batchmates." },
              { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, bg:"rgba(236,72,153,0.09)", title:"Smart Search", desc:"Search students, posts, reels and events — instant debounced results." },
            ].map(f => (
              <div key={f.title} className="feature-card-land">
                <div style={{ width:44, height:44, borderRadius:14, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#111827", marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITIES */}
      <section style={{ padding:"60px 24px", background:"linear-gradient(160deg,#f0f4ff 0%,#faf0ff 100%)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-block", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700, color:c.primary, marginBottom:14 }}>Communities</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:900, color:"#111827", letterSpacing:"-1px", marginBottom:8 }}>Find your tribe</h2>
          <p style={{ fontSize:15, color:"#6b7280", maxWidth:360, margin:"0 auto" }}>6 communities already live. Join the conversation.</p>
        </div>
        <div style={{ display:"flex", gap:12, overflowX:"auto", scrollbarWidth:"none", paddingBottom:8, maxWidth:1000, margin:"0 auto" }}>
          {[
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, bg:"rgba(99,102,241,0.10)", name:"LPU Coders", members:"2.1k"},
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, bg:"rgba(236,72,153,0.10)", name:"Campus Life", members:"3.4k"},
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, bg:"rgba(245,158,11,0.10)", name:"Hackathons", members:"1.8k"},
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, bg:"rgba(16,185,129,0.10)", name:"Study Groups", members:"1.2k"},
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>, bg:"rgba(139,92,246,0.10)", name:"Startups", members:"890"},
            {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, bg:"rgba(239,68,68,0.10)", name:"Sports", members:"650"},
          ].map(cm => (
            <div key={cm.name} className="comm-card" onClick={() => navigate("/register")}>
              <div style={{ width:40,height:40,borderRadius:12,background:cm.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>{cm.icon}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{cm.name}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{cm.members} members</div>
              <button style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, color:"#fff", border:"none", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:700, cursor:"pointer", width:"fit-content", fontFamily:"inherit" }}>Join</button>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"60px 24px", background:"#fff" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <div style={{ display:"inline-block", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700, color:c.primary, marginBottom:14 }}>From Vertos</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:900, color:"#111827", letterSpacing:"-1px", marginBottom:32 }}>What students say</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
            {[
              { text:`"Finally found my hackathon team through LPU Town Communities. We won Makeathon 8.0!"`, name:"Rahul Sharma", role:"MCA, Block 38", av:"R", grad:`linear-gradient(135deg,${c.gradientA},${c.gradientB})` },
              { text:`"The reels feature is insane. Posted my project demo and got 50 DMs in one day."`, name:"Ananya Gupta", role:"B.Tech CSE, 3rd Year", av:"A", grad:"linear-gradient(135deg,#ec4899,#f59e0b)" },
              { text:`"Organized my first workshop for 200+ students through the Events feature. Smooth!"`, name:"Karan Thakur", role:"B.Tech ECE, Final Year", av:"K", grad:"linear-gradient(135deg,#10b981,#3b82f6)" },
            ].map(t => (
              <div key={t.name} style={{ background:"rgba(255,255,255,0.95)", border:"1px solid rgba(200,200,220,0.40)", borderRadius:18, padding:22, textAlign:"left", transition:"all 0.2s", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(99,102,241,0.10)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:14, fontStyle:"italic" }}>{t.text}</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:t.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>{t.av}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"60px 24px" }}>
        <div style={{ background:`linear-gradient(135deg,${c.gradientA},${c.gradientB},${c.gradientC})`, backgroundSize:"200% 200%", animation:"gradient-shift 4s ease infinite", borderRadius:28, padding:"56px 32px", textAlign:"center", maxWidth:700, margin:"0 auto", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)", top:-60, left:-60 }} />
          <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.06)", bottom:-40, right:-40 }} />
          <h2 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:12, position:"relative" }}>Ready to join your campus network?</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.80)", marginBottom:28, lineHeight:1.6, position:"relative" }}>Over 10,000 LPU students are already on LPU Town. Your tribe is waiting.</p>
          <button onClick={() => navigate("/register")} style={{ padding:"15px 36px", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", background:"#fff", color:c.primary, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,0.15)", position:"relative", transition:"transform 0.15s", fontFamily:"inherit" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >Get Started — It's Free</button>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:14, position:"relative" }}>Exclusive to LPU students · @lpu.in email required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid rgba(200,200,220,0.30)", background:"#fff", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg,${c.gradientA},${c.gradientB})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>L</div>
          <span style={{ fontSize:14, fontWeight:800, color:"#111827" }}>LPU<span style={{ color:c.primary }}>Town</span></span>
        </div>
        <p style={{ fontSize:12, color:"#9ca3af" }}>For Vertos, By Vertos · © 2025</p>
      </footer>
    </div>
  )
}

function NotifCard({ style, icon, iconBg, showOnline, title, sub, tag, tagBg, tagColor, badge, badgeBg, extra }) {
  return (
    <div className="notif-card" style={style}>
      <div className="c-icon" style={{ background:iconBg }}>
        {icon}
        {showOnline && <div className="c-online" />}
      </div>
      <div style={{ flex:1 }}>
        <div className="c-title">{title}</div>
        <div className="c-sub">{sub}</div>
        {tag && <div className="c-tag" style={{ background:tagBg, color:tagColor }}>{tag}</div>}
        {extra}
      </div>
      {badge && <div style={{ width:20, height:20, borderRadius:"50%", background:badgeBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff", flexShrink:0 }}>{badge}</div>}
    </div>
  )
}