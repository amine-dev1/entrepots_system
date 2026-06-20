export default function StockBadge({ disponible, minimum }) {
  const alerte = Number(disponible) <= Number(minimum ?? 0)
  const cls = alerte
    ? 'bg-red-100 text-red-700 ring-red-200'
    : 'bg-green-100 text-green-700 ring-green-200'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${cls}`}>
      {disponible}
      {alerte && <span title="Sous le seuil minimum">⚠</span>}
    </span>
  )
}
