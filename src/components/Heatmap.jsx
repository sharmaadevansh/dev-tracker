import React from 'react'

export default function Heatmap({ rows = 7, cols = 4, data = [], lastActiveDayIndex = 26 }) {
  // Generate list of days dynamically matching rows x cols
  const cells = React.useMemo(() => {
    const total = rows * cols
    const list = []
    const today = new Date()
    
    for (let i = 0; i < total; i++) {
      // Calculate date relative to today (i = 0 is oldest, i = total-1 is today)
      const date = new Date()
      date.setDate(today.getDate() - (total - 1 - i))
      
      // Seed randomized counts but guarantee high activity on last active day
      const isLast = i === lastActiveDayIndex
      const count = isLast 
        ? 4 
        : data[i]?.count !== undefined 
          ? data[i].count 
          : Math.max(0, Math.floor(Math.random() * 5) - 2)

      list.push({
        index: i,
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        count,
        isLastActive: isLast
      })
    }
    return list
  }, [rows, cols, data, lastActiveDayIndex])

  // Get intensity color class based on count
  const getCellColor = (count, isLastActive) => {
    if (isLastActive) return 'bg-signal border-2 border-signal ring-2 ring-signal/40 scale-110 shadow-[0_0_12px_rgba(0,0,0,0.32)]'
    if (count === 0) return 'bg-steel/30 border border-hairline/25'
    if (count === 1) return 'bg-signal/20 border border-signal/10'
    if (count === 2) return 'bg-signal/45 border border-signal/20'
    if (count === 3) return 'bg-signal/70 border border-signal/30'
    return 'bg-signal border border-signal/40' // Full intensity
  }

  return (
    <div className="flex flex-col gap-2 font-mono">
      <div className="flex items-start gap-2.5">
        {/* Day Labels */}
        <div className="flex flex-col justify-between text-[9px] text-chrome-dim/75 h-[105px] py-1 select-none font-bold">
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
              title={`${cell.count} updates on ${cell.date} ${cell.isLastActive ? '(LAST ACTIVE DAY)' : ''}`}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 hover:scale-125 cursor-help ${
                cell.isLastActive 
                  ? 'bg-signal border-2 border-signal ring-2 ring-signal/40 led-pulse scale-110 shadow-[0_0_12px_rgba(0,0,0,0.32)]' 
                  : getCellColor(cell.count, false)
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[9px] text-chrome-dim/75 mt-1 select-none font-semibold justify-end">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-full bg-steel/30 border border-hairline/25" />
        <div className="w-2.5 h-2.5 rounded-full bg-signal/20 border border-signal/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-signal/45 border border-signal/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-signal" />
        <span>More</span>
        <span className="mx-2 text-chrome-dim/40">|</span>
        <div className="w-2.5 h-2.5 rounded-full bg-signal border-2 border-signal ring-1 ring-signal/30 led-pulse" />
        <span className="text-signal-dim font-bold">Last Active Day</span>
      </div>
    </div>
  )
}
