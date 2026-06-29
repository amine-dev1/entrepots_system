import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = '— Sélectionner —',
  className = '',
  disabled = false,
  icon: Icon = null,
  id,
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const rootRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target) &&
          listRef.current && !listRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onScroll() {
      if (!rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => String(o.value) === String(value))
      setHighlight(idx)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = useCallback((opt) => {
    if (opt.disabled) return
    onChange(opt.value)
    setOpen(false)
  }, [onChange])

  function onKeyDown(e) {
    if (disabled) return
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault(); setOpen(true); return
    }
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => Math.min((h < 0 ? -1 : h) + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max((h < 0 ? options.length : h) - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && options[highlight]) choose(options[highlight])
    }
  }

  const dropdown = open && createPortal(
    <ul
      ref={listRef}
      role="listbox"
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width }}
      className={cn(
        'z-[9999] max-h-60 overflow-auto py-1',
        'bg-white border border-gray-100 rounded-lg shadow-lg',
        'origin-top animate-[dropdown_120ms_ease-out]',
      )}
    >
      {options.length === 0 && (
        <li className="px-3 py-2 text-sm text-gray-400">Aucune option</li>
      )}
      {options.map((opt, idx) => {
        const isSelected = String(opt.value) === String(value)
        const isHi = idx === highlight
        return (
          <li
            key={idx}
            role="option"
            aria-selected={isSelected}
            onMouseEnter={() => setHighlight(idx)}
            onMouseDown={(e) => { e.preventDefault(); choose(opt) }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none',
              opt.disabled && 'opacity-40 cursor-not-allowed',
              isHi && !opt.disabled && 'bg-primary-50',
              isSelected ? 'text-primary-700 font-medium' : 'text-gray-700',
            )}
          >
            <span className="flex-1 truncate">{opt.label}</span>
            {isSelected && <Check size={15} className="text-primary-600 shrink-0" />}
          </li>
        )
      })}
    </ul>,
    document.body
  )

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-2 px-3.5 py-2.5 bg-white border rounded-lg text-sm text-left',
          'outline-none transition-all duration-150',
          open ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        )}
      >
        {Icon && <Icon size={15} className="text-gray-400 shrink-0" />}
        <span className={cn('flex-1 truncate', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('text-gray-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {dropdown}
    </div>
  )
}
