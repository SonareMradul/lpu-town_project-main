export default function RightPanel() {
  const trending = [
    { name: "Rahul Sharma", role: "Frontend Lead", initial: "R" },
    { name: "Ananya Gupta", role: "UI/UX Designer", initial: "A" },
    { name: "Arjun Mehta", role: "Cyber Security", initial: "A" },
  ];

  return (
    <div className="w-[300px] sticky top-20 h-[calc(100vh-80px)] hidden xl:flex flex-col gap-8 py-8 px-6 border-l border-white/5 bg-[#0A0A0A] selection:bg-[#FF6B00]">
      
      {/* Section 1: Trending Students */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            # Trending_Vertos
          </h3>
          <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse"></span>
        </div>

        <div className="flex flex-col gap-5">
          {trending.map((user, index) => (
            <div key={index} className="group flex items-center gap-4 cursor-pointer">
              {/* Avatar with Brutalist Border */}
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-[#FF6B00] transition-all duration-300">
                <span className="text-[10px] font-black text-zinc-500 group-hover:text-white">{user.initial}</span>
              </div>
              
              {/* Info */}
              <div className="flex flex-col">
                <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-[#FF6B00] transition-colors">
                  {user.name}
                </p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
                  {user.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Quick Stats / Campus Pulse */}
      <section className="mt-4 p-6 bg-[#111111] rounded-[2rem] border border-white/5">
        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Campus_Pulse</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-zinc-400">Live Hackathons</span>
            <span className="text-sm font-black text-white">02</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-zinc-400">Events Today</span>
            <span className="text-sm font-black text-white">05</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
            <div className="w-2/3 h-full bg-[#FF6B00]"></div>
          </div>
        </div>
      </section>

      {/* Section 3: Footer Links */}
      <div className="mt-auto opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">
          Systems // Active
        </p>
        <div className="flex gap-4 text-[8px] font-bold text-zinc-600">
          <a href="#" className="hover:text-white">Policy</a>
          <a href="#" className="hover:text-white">Verto_API</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </div>

    </div>
  )
}