export default function ReelCard() {
  return (
    <div className="w-[340px] h-[600px] bg-[#111111] rounded-[2.5rem] relative overflow-hidden border border-white/5 shadow-2xl group">
      
      {/* Video Placeholder / Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
      <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <span className="text-zinc-800 font-black italic text-4xl opacity-20 select-none">LPU_VIBE</span>
      </div>

      {/* Top Header: Branding Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Live // Campus</span>
      </div>

      {/* Bottom Content: User Info & Caption */}
      <div className="absolute bottom-8 left-6 right-16 z-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center border border-white/10">
            <span className="text-[10px] font-black text-white">R</span>
          </div>
          <p className="text-sm font-black uppercase tracking-tighter text-white">Rahul Sharma</p>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-medium italic line-clamp-2">
          <span className="text-[#FF6B00] font-black not-italic mr-1">#</span>
          Hackathon night at LPU. Building the future layer by layer. 🚀
        </p>
      </div>

      {/* Right Interaction Sidebar: Glass Style */}
      <div className="absolute right-4 bottom-8 z-20 flex flex-col gap-6 items-center py-6 px-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
        
        <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
          <div className="text-xl group-hover/btn:scale-125 transition-transform">❤️</div>
          <span className="text-[8px] font-black text-white/60">2.4K</span>
        </div>

        <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
          <div className="text-xl group-hover/btn:scale-125 transition-transform">💬</div>
          <span className="text-[8px] font-black text-white/60">128</span>
        </div>

        <div className="flex flex-col items-center gap-1 group/btn cursor-pointer">
          <div className="text-xl group-hover/btn:scale-125 transition-transform">📤</div>
          <span className="text-[8px] font-black text-white/60">Share</span>
        </div>

        <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00] overflow-hidden mt-2 animate-spin-slow">
           <div className="w-full h-full bg-zinc-800" />
        </div>
      </div>

    </div>
  )
}