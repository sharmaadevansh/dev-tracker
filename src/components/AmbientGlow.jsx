// Lightweight, hardware-accelerated ambient glow system for DevTrack.AI
// Runs via GPU composited layers without CPU/JS thread overhead

export default function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Top-left subtle lime ambient aura */}
      <div 
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(184, 242, 47, 0.35) 0%, transparent 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
      />

      {/* Bottom-right subtle violet ambient aura */}
      <div 
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 animate-float-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(140, 99, 255, 0.35) 0%, transparent 70%)',
          filter: 'blur(55px)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
