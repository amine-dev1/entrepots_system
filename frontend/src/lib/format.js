export function money(value) {
  const n = Number(value ?? 0)
  return n.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })
}

export function apiError(error) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    'Une erreur est survenue.'
  )
}
