/**
 * Safe date parsing - returns null for invalid values.
 * Prevents RangeError: invalid date when API returns unexpected formats.
 */
export function safeParseDate(val) {
  if (val == null || val === '') return null
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Default options for Harare timezone display */
const HARARE_OPTS = { timeZone: 'Africa/Harare' }

/**
 * Format date for display (Harare timezone), or return fallback for invalid dates.
 */
export function formatDate(val, options = {}, fallback = '-') {
  const d = safeParseDate(val)
  if (!d) return fallback
  return d.toLocaleDateString('en-ZA', { ...HARARE_OPTS, ...options })
}

/**
 * Format date and time for display (Harare timezone), or return fallback for invalid dates.
 */
export function formatDateTime(val, options = {}, fallback = '-') {
  const d = safeParseDate(val)
  if (!d) return fallback
  return d.toLocaleString('en-ZA', { ...HARARE_OPTS, ...options })
}
