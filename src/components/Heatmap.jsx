import React from 'react'

export default function Heatmap({
  rows = 7,
  cols = 16,
  data = null,
  colorScheme = 'signal', // 'signal' | 'yellow' | 'violet' | 'green'
  label = 'updates',
}) {
  // Normalize incoming data (can be Unix timestamps map, ISO date map, or array)
  const countMap = React.useMemo(() => {
    if (!data) return null
    const map = new Map()

    // 1. Array of { date, count }
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (!item) return
        const key = typeof item.date === 'string' ? item.date.slice(0, 10) : ''
        if (key) map.set(key, (map.get(key) || 0) + (item.count !== undefined ? item.count : 1))
      })
      return map
    }

    // 2. Object map
    if (typeof data === 'object') {
      Object.entries(data).forEach(([k, v]) => {
        let dateKey = ''
        // Is key a Unix timestamp in seconds?
        if (/^\d{9,12}$/.test(k)) {
          const d = new Date(parseInt(k, 10) * 1000)
          dateKey = d.toISOString().slice(0, 10)
        } else if (/^\d{4}-\d{2}-\d{2}/.test(k)) {
          dateKey = k.slice(0, 10)
        }
        if (dateKey) {
          const count = typeof v === 'number' ? v : parseInt(v, 10) || 0
          map.set(dateKey, (map.get(dateKey) || 0) + count)
        }
      })
      return map
    }

    return null
  }, [data])

  // Generate real calendar cells matching rows x cols
  const { cells, totalActivity } = React.useMemo(() => {
    const total = rows * cols
    const list = []
    const today = new Date()
    let latestActiveIdx = -1
    let sum = 0

    for (let i = 0; i < total; i++) {
      const cellDate = new Date()
      cellDate.setDate(today.getDate() - (total - 1 - i))
      const dateKey = cellDate.toISOString().slice(0, 10)

      let count = 0
      if (countMap && countMap.has(dateKey)) {
        count = countMap.get(dateKey)
      }
      sum += count

      if (count > 0) {
        latestActiveIdx = i
      }

      list.push({
        index: i,
        dateKey,
        date: cellDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        count,
        isLastActive: false,
      })
    }

    // Mark the real last active day
    if (latestActiveIdx !== -1 && list[latestActiveIdx]) {
      list[latestActiveIdx].isLastActive = true
    }

    return { cells: list, totalActivity: sum }
  }, [rows, cols, countMap])

  // Theme styling based on colorScheme
  const getSchemeStyles = () => {
    switch (colorScheme) {
      case 'yellow':
        return {
          activeBorder: 'border-yellow',
          ring: 'ring-yellow/40',
          pulseClass: 'bg-yellow border-2 border-yellow ring-2 ring-yellow/40 led-pulse scale-110 shadow-[0_0_12px_rgba(255,213,61,0.5)]',
          c1: 'bg-yellow/20 border border-yellow/20',
          c2: 'bg-yellow/45 border border-yellow/30',
          c3: 'bg-yellow/70 border border-yellow/40',
          c4: 'bg-yellow border border-yellow/50',
          legendBg: 'bg-yellow',
          legendText: 'text-yellow font-bold',
        }
      case 'violet':
        return {
          activeBorder: 'border-violet',
          ring: 'ring-violet/40',
          pulseClass: 'bg-violet border-2 border-violet ring-2 ring-violet/40 led-pulse scale-110 shadow-[0_0_12px_rgba(140,99,255,0.5)]',
          c1: 'bg-violet/20 border border-violet/20',
          c2: 'bg-violet/45 border border-violet/30',
          c3: 'bg-violet/70 border border-violet/40',
          c4: 'bg-violet border border-violet/50',
          legendBg: 'bg-violet',
          legendText: 'text-violet font-bold',
        }
      case 'green':
        return {
          activeBorder: 'border-signal',
          ring: 'ring-signal/40',
          pulseClass: 'bg-signal border-2 border-signal ring-2 ring-signal/40 led-pulse scale-110 shadow-[0_0_12px_rgba(184,242,47,0.5)]',
          c1: 'bg-signal/20 border border-signal/15',
          c2: 'bg-signal/45 border border-signal/30',
          c3: 'bg-signal/70 border border-signal/45',
          c4: 'bg-signal border border-signal/60',
          legendBg: 'bg-signal',
          legendText: 'text-signal-dim font-bold',
        }
      case 'signal':
      default:
        return {
          activeBorder: 'border-signal',
          ring: 'ring-signal/40',
          pulseClass: 'bg-signal border-2 border-signal ring-2 ring-signal/40 led-pulse scale-110 shadow-[0_0_12px_rgba(184,242,47,0.5)]',
          c1: 'bg-signal/20 border border-signal/15',
          c2: 'bg-signal/45 border border-signal/30',
          c3: 'bg-signal/70 border border-signal/45',
          c4: 'bg-signal border border-signal/60',
          legendBg: 'bg-signal',
          legendText: 'text-signal-dim font-bold',
        }
    }
  }

  const theme = getSchemeStyles()

  const getCellColor = (count, isLastActive) => {
    if (isLastActive) return theme.pulseClass
    if (count === 0) return 'bg-steel/30 border border-hairline/25'
    if (count === 1) return theme.c1
    if (count <= 3) return theme.c2
    if (count <= 6) return theme.c3
    return theme.c4
  }

  return (
    <div className="flex flex-col gap-2 font-sans w-full">
      <div className="flex items-start gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {/* Day Labels */}
        <div className="flex flex-col justify-between text-[11px] text-chrome-dim/75 h-[105px] py-0.5 select-none font-semibold shrink-0">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 h-[105px] items-center">
          {cells.map((cell) => (
            <div
              key={cell.index}
              title={`${cell.count} ${label} on ${cell.date}${cell.isLastActive ? ' (LAST ACTIVE DAY)' : ''}`}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 hover:scale-135 cursor-help ${
                cell.isLastActive
                  ? theme.pulseClass
                  : getCellColor(cell.count, false)
              }`}
            />
          ))}
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-[11px] text-chrome-dim/75 mt-1 select-none font-medium">
        <span className="text-[11px] font-sans text-chrome-dim">
          Total tracked: <strong className="text-chrome font-display tabular-nums">{totalActivity}</strong> {label}
        </span>

        <div className="flex items-center gap-1.5 justify-end">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-full bg-steel/30 border border-hairline/25" />
          <div className={`w-2.5 h-2.5 rounded-full ${theme.c1}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${theme.c2}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${theme.c4}`} />
          <span>More</span>
          <span className="mx-2 text-chrome-dim/40">|</span>
          <div className={`w-2.5 h-2.5 rounded-full ${theme.legendBg} border-2 ${theme.activeBorder} ring-1 ${theme.ring} led-pulse`} />
          <span className={theme.legendText}>Last Active</span>
        </div>
      </div>
    </div>
  )
}
