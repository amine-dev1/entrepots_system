// Helpers partagés (conception §4.1 : lib/utils.js)

// Formatte une date ISO en jj mois aaaa (locale FR par défaut).
export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Formatte un montant en devise (MAD par défaut).
export function formatMoney(amount, currency = 'MAD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(amount)
}

// Concatène des classes CSS conditionnelles (équivalent léger de clsx/cn).
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Couleur de badge par rôle (noms de rôles seedés en minuscules côté backend).
export function getRoleBadgeColor(role) {
  const map = {
    administrateur: 'bg-purple-100 text-purple-700',
    gestionnaire:   'bg-blue-100 text-blue-700',
    magasinier:     'bg-green-100 text-green-700',
    auditeur:       'bg-gray-100 text-gray-700',
  }
  return map[role] || 'bg-gray-100 text-gray-600'
}
