import { Calendar } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function DateInput({ value, onChange, placeholder = 'jj/mm/aaaa', className = '', label, ...rest }) {
  return (
    <div className={cn('relative', className)}>
      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900',
          'outline-none transition-colors',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
          '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer',
        )}
        {...rest}
      />
    </div>
  )
}
