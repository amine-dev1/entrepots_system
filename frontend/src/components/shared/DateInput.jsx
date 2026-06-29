import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import { format, parse, isValid } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function DateInput({ value, onChange, placeholder = 'jj/mm/aaaa', className = '', ...rest }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const rootRef = useRef(null)
  const panelRef = useRef(null)

  const dateObj = value ? parse(value, 'yyyy-MM-dd', new Date()) : null
  const validDate = dateObj && isValid(dateObj) ? dateObj : null
  const displayText = validDate ? format(validDate, 'dd MMM yyyy', { locale: fr }) : ''

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target) &&
          panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const panelHeight = 340
    const top = spaceBelow > panelHeight
      ? rect.bottom + window.scrollY + 4
      : rect.top + window.scrollY - panelHeight - 4
    setPos({ top, left: rect.left + window.scrollX })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onScroll() {
      if (!rootRef.current) return
      const rect = rootRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const panelHeight = 340
      const top = spaceBelow > panelHeight
        ? rect.bottom + window.scrollY + 4
        : rect.top + window.scrollY - panelHeight - 4
      setPos({ top, left: rect.left + window.scrollX })
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  function handleSelect(day) {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'))
    }
    setOpen(false)
  }

  function handleClear(e) {
    e.stopPropagation()
    onChange('')
  }

  const calendar = open && createPortal(
    <div
      ref={panelRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
      className={cn(
        'z-[9999] bg-white border border-gray-100 rounded-xl shadow-lg p-3',
        'origin-top animate-[dropdown_120ms_ease-out]',
      )}
    >
      <DayPicker
        mode="single"
        selected={validDate}
        onSelect={handleSelect}
        defaultMonth={validDate || new Date()}
        locale={fr}
        showOutsideDays
        classNames={{
          root: 'text-sm',
          months: 'flex flex-col',
          month_caption: 'flex justify-center items-center h-8',
          caption_label: 'text-sm font-semibold text-gray-900',
          nav: 'flex items-center justify-between absolute top-3 left-2 right-2',
          button_previous: 'p-1 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors',
          button_next: 'p-1 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors',
          weekdays: 'grid grid-cols-7 mb-1',
          weekday: 'text-xs font-medium text-gray-400 text-center py-1',
          weeks: '',
          week: 'grid grid-cols-7',
          day: 'text-center p-0',
          day_button: cn(
            'w-8 h-8 rounded-lg text-sm transition-colors cursor-pointer',
            'hover:bg-primary-50 hover:text-primary-700',
          ),
          selected: 'bg-primary-600 text-white hover:bg-primary-700 rounded-lg',
          today: 'font-bold text-primary-600',
          outside: 'text-gray-300',
          disabled: 'text-gray-200 cursor-not-allowed',
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === 'left'
              ? <ChevronLeft size={16} />
              : <ChevronRight size={16} />,
        }}
      />
    </div>,
    document.body
  )

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3.5 py-2.5 bg-white border rounded-lg text-sm text-left',
          'outline-none transition-all duration-150',
          open ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300',
        )}
        {...rest}
      >
        <Calendar size={15} className="text-gray-400 shrink-0" />
        <span className={cn('flex-1 truncate', displayText ? 'text-gray-900' : 'text-gray-400')}>
          {displayText || placeholder}
        </span>
        {value && (
          <span
            role="button"
            onMouseDown={handleClear}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          >
            <X size={14} />
          </span>
        )}
      </button>
      {calendar}
    </div>
  )
}
