export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function formatMoney(amount, currency = 'MAD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency', currency, minimumFractionDigits: 2
  }).format(amount)
}

export function getRoleBadgeColor(role) {
  const map = {
    'Administrateur': 'bg-purple-100 text-purple-700',
    'Gestionnaire de stock': 'bg-blue-100 text-blue-700',
    'Magasinier': 'bg-green-100 text-green-700',
    'Auditeur': 'bg-gray-100 text-gray-700',
  }
  return map[role] || 'bg-gray-100 text-gray-600'
}
