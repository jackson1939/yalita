export function QuipuCard({ name, score, date }: { name: string; score: number; date: string }) {
  return (
    <div 
      className="relative w-full aspect-[1.6/1] overflow-hidden p-6 flex flex-col justify-between"
      style={{
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        border: "1px solid var(--y-amber)",
        backgroundColor: "var(--y-card-dark)",
        color: "var(--y-text-on-dark)",
      }}
    >
      {/* Patrón Andino SVG */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="andean-pattern" width="24" height="16" patternUnits="userSpaceOnUse">
              <path d="M6 0 L12 4 L6 8 L0 4 Z" fill="var(--y-primary)" />
              <path d="M18 0 L24 4 L18 8 L12 4 Z" fill="var(--y-amber)" />
              <path d="M0 8 L6 12 L0 16 L-6 12 Z" fill="var(--y-amber)" />
              <path d="M12 8 L18 12 L12 16 L6 12 Z" fill="var(--y-primary)" />
              <path d="M24 8 L30 12 L24 16 L18 12 Z" fill="var(--y-amber)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#andean-pattern)" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(30,34,53,0.8), rgba(30,34,53,0.5), rgba(45,27,105,0.8))" }}></div>

      <div className="flex justify-between items-start z-10 relative">
        <div>
          <h3 className="font-serif text-2xl drop-shadow-md" style={{ color: "var(--y-text-on-dark)" }}>Yalita</h3>
          <p className="text-xs font-medium tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>Tu reputación es tu mayor activo</p>
        </div>
        <div
          className="text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm"
          style={{
            background: "rgba(44,180,98,0.2)",
            border: "1px solid rgba(44,180,98,0.5)",
            color: "var(--y-green)",
          }}
        >
          <span>Verificado</span>
          <span>✓</span>
        </div>
      </div>

      <div className="flex justify-between items-end z-10 relative">
        <div>
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>TITULAR</p>
          <p className="font-medium text-lg tracking-wide drop-shadow-sm">{name.toUpperCase()}</p>
          <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>EMISIÓN: {date}</p>
        </div>
        <div className="text-right">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>SCORE</p>
          <p className="font-lora text-4xl" style={{ color: "var(--y-amber)", filter: "drop-shadow(0 0 10px rgba(245,158,11,0.5))" }}>{score}</p>
        </div>
      </div>
    </div>
  );
}
