import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, GraduationCap, MapPin, Check, X, ChevronDown, Building2 } from 'lucide-react'
import { searchUniversities } from '../data/indianUniversities'

/**
 * UniversitySelect - Standardized Searchable Dropdown for Indian Universities & Institutes.
 * 
 * Prevents spelling discrepancies by standardizing university identity across:
 * - Official Full Institute Name
 * - Campus City
 * - State
 * 
 * Supports instant multi-token search across Name, Alias/ShortName, City, and State.
 */
export default function UniversitySelect({
  value = '',
  onChange,
  placeholder = 'Search by college name, city (e.g. Pune, Mumbai), or state...',
  className = '',
  id = 'university-select',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Filter universities based on user query
  const filteredUniversities = useMemo(() => {
    return searchUniversities(query, 60)
  }, [query])

  // Click outside listener to automatically dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset highlight on query change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[highlightedIndex]
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleSelect = (uni) => {
    const standardName = uni.standardLabel || `${uni.name} (${uni.city}, ${uni.state})`
    onChange(standardName)
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredUniversities.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredUniversities[highlightedIndex]) {
        handleSelect(filteredUniversities[highlightedIndex])
      } else if (query.trim()) {
        // Allow custom entry if no option selected
        onChange(query.trim())
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Selected Box / Trigger Header */}
      <div
        onClick={() => {
          setIsOpen(!isOpen)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-void/90 border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 shadow-sm ${
          isOpen
            ? 'border-violet/70 ring-1 ring-violet/30 shadow-[0_0_15px_rgba(140,99,255,0.15)]'
            : 'border-hairline hover:border-chrome-dim/50'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="w-7 h-7 rounded-lg bg-violet/10 border border-violet/25 flex items-center justify-center text-violet shrink-0">
            <GraduationCap size={15} />
          </div>

          {value ? (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-chrome truncate leading-tight">
                {value}
              </span>
              <span className="text-[10px] text-signal font-mono flex items-center gap-1">
                <Check size={10} className="inline" /> Standardized Affiliation
              </span>
            </div>
          ) : (
            <span className="text-xs text-chrome-dim/70 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-chrome-dim hover:text-chrome hover:bg-steel transition-colors"
              title="Clear university"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-chrome-dim transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-violet' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-gunmetal/95 backdrop-blur-xl border border-hairline/80 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[380px] animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-hairline/60 bg-void/50 flex items-center gap-2">
            <Search size={14} className="text-chrome-dim shrink-0 ml-1" />
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search 800+ universities by name, city, or state..."
              className="w-full bg-transparent border-none text-xs text-chrome placeholder:text-chrome-dim/60 outline-none font-sans"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-chrome-dim hover:text-chrome rounded-md hover:bg-steel"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="px-3.5 py-1.5 bg-steel/30 border-b border-hairline/30 flex items-center justify-between text-[11px] text-chrome-dim font-mono">
            <span>
              {query
                ? `${filteredUniversities.length} institutions match "${query}"`
                : `800+ Indian Institutions (IITs, NITs, Central & State Universities)`}
            </span>
            <span className="text-[10px] text-violet font-semibold uppercase tracking-wider">
              Pan-India Directory
            </span>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="overflow-y-auto flex-1 divide-y divide-hairline/30 scrollbar-thin scrollbar-thumb-steel scrollbar-track-transparent p-1"
          >
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((uni, idx) => {
                const isSelected = value === uni.standardLabel
                const isHighlighted = idx === highlightedIndex

                return (
                  <button
                    key={uni.id || `${uni.name}-${uni.city}`}
                    type="button"
                    onClick={() => handleSelect(uni)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 ${
                      isHighlighted
                        ? 'bg-violet/15 text-chrome'
                        : isSelected
                        ? 'bg-steel/60 text-chrome'
                        : 'hover:bg-steel/40 text-chrome/90'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-signal/20 text-signal border border-signal/30'
                            : 'bg-void text-chrome-dim border border-hairline'
                        }`}
                      >
                        <Building2 size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-chrome truncate">
                            {uni.name}
                          </span>
                          {uni.shortName && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-steel text-chrome-dim border border-hairline">
                              {uni.shortName}
                            </span>
                          )}
                        </div>

                        {/* City & State Badge */}
                        <div className="flex items-center gap-1 text-[11px] text-chrome-dim mt-0.5">
                          <MapPin size={11} className="text-violet shrink-0" />
                          <span className="font-sans font-medium text-chrome-dim/90">
                            {uni.city}, {uni.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-signal/15 text-signal flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-chrome-dim">
                  No registered Indian university found matching{' '}
                  <span className="text-chrome font-semibold">"{query}"</span>
                </p>
                {query.trim().length >= 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim())
                      setIsOpen(false)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet/20 hover:bg-violet/30 text-violet border border-violet/30 transition-all cursor-pointer"
                  >
                    <span>Use custom affiliation:</span>
                    <strong className="underline">{query.trim()}</strong>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
