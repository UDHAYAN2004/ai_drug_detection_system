// No external dependencies — uses native JS Date

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit'
    })
  } catch { return dateStr }
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  } catch { return dateStr }
}

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  } catch { return dateStr }
}

export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

export const getRiskBadgeClass = (level) => {
  const map = {
    critical: 'badge-critical',
    high:     'badge-high',
    medium:   'badge-medium',
    low:      'badge-low',
  }
  return map[level?.toLowerCase()] || 'badge-pending'
}

export const getStatusBadgeClass = (status) => {
  const map = {
    clean:        'badge-clean',
    detected:     'badge-detected',
    inconclusive: 'badge-pending',
    active:       'badge-active',
    inactive:     'badge-pending',
    suspended:    'badge-critical',
    pending:      'badge-pending',
    under_review: 'badge-active',
    confirmed:    'badge-detected',
    dismissed:    'badge-clean',
    banned:       'badge-critical',
  }
  return map[status?.toLowerCase()] || 'badge-pending'
}
