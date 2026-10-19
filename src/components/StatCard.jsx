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

export default function StatCard({ icon: Icon, label, value, suffix = '', accent = false, loading = false, subtext = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="glass glass-interactive p-5 sm:p-6 flex flex-col justify-between gap-3 relative overflow-hidden group transition-all duration-300 cursor-pointer rounded-[24px]"
    >
      {/* Top subtle hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent opacity-80" />

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-chrome-dim font-semibold font-sans">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              accent
                ? 'bg-violet/10 border border-violet/25 text-violet group-hover:shadow-[0_0_12px_rgba(140,99,255,0.25)]'
                : 'bg-signal/15 border border-signal/30 text-signal-dim dark:text-signal group-hover:shadow-[0_0_12px_rgba(184,242,47,0.25)]'
            }`}
          >
            <Icon size={16} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="font-display text-2xl sm:text-3xl font-bold text-chrome tabular-nums leading-none tracking-tight">
          {loading ? (
            <span className="inline-block w-16 h-7 bg-steel rounded-full animate-pulse" />
          ) : (
            <>
              <CountUp value={value ?? 0} />
              {suffix}
            </>
          )}
        </div>
        {subtext && (
          <span className="text-[11px] font-sans text-chrome-dim/80">{subtext}</span>
        )}
      </div>

      {/* Dynamic ambient accent corner glow */}
      <div
        className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:scale-125 ${
          accent ? 'bg-violet/20' : 'bg-signal/20'
        }`}
      />
    </motion.div>
  )
}
