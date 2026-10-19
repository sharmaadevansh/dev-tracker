export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 h-[104px] animate-pulse">
      <div className="h-3 w-20 bg-steel rounded mb-4" />
      <div className="h-7 w-24 bg-steel rounded" />
    </div>
  )
}

export function InlineSpinner({ label = 'Syncing' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-chrome-dim font-sans font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-signal led-pulse" />
      {label}...
    </div>
  )
}
