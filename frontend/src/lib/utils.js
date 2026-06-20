// Helpers partagés (conception §4.1 : lib/utils.js)

// Formatte une date ISO en jj/mm/aaaa (locale FR par défaut).
export function formatDate(value, locale = 'fr-FR') {
  if (!value) return ''
  return new Date(value).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Formatte un montant en devise (MAD par défaut).
export function formatMoney(amount, currency = 'MAD', locale = 'fr-FR') {
  const n = Number(amount ?? 0)
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n)
}

// Concatène des classes CSS conditionnelles (équivalent léger de clsx/cn).
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
