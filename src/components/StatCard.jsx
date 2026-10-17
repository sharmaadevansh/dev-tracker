import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

function CountUp({ value }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('en-IN'))

  useEffect(() => {
    const controls = animate(count, Number(value) || 0, { duration: 1.1, ease: 'easeOut' })
    return controls.stop
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
}

export default function StatCard({ icon: Icon, label, value, suffix = '', accent = false, loading = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ 
        y: -4
      }}
      className="glass p-6 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-chrome-dim font-bold font-mono">{label}</span>
        {Icon && (
          <Icon
            size={16}
            className={accent ? 'text-violet' : 'text-signal'}
            strokeWidth={2}
          />
        )}
      </div>
      <div className="font-display text-3xl font-bold text-chrome tabular-nums leading-none tracking-tight">
        {loading ? (
          <span className="inline-block w-16 h-7 bg-steel rounded-full animate-pulse" />
        ) : (
          <>
            <CountUp value={value ?? 0} />
            {suffix}
          </>
        )}
      </div>
      
      {/* Dynamic glow circles */}
      <div className={`absolute -bottom-8 -right-8 w-20 h-20 rounded-full blur-2xl transition-all duration-500 ${
        accent 
          ? 'bg-black/5 group-hover:bg-black/12 group-hover:scale-110' 
          : 'bg-black/5 group-hover:bg-black/12 group-hover:scale-110'
      }`} />
    </motion.div>
  )
}
