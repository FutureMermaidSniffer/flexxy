/**
 * Normalize a submitted calling code to +<digits>.
 * Accepts "+44", "44", "0044"; returns null for empty/invalid values.
 */
function normalizeCountryCode(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/[^\d]/g, '').replace(/^0+/, '');
  if (digits.length < 1 || digits.length > 4) return null;

  return `+${digits}`;
}

function formatPhone(phone, countryCode) {
  if (!phone) return null;
  const trimmed = String(phone).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('+')) return trimmed;

  const code = normalizeCountryCode(countryCode);
  return code ? `${code} ${trimmed}` : trimmed;
}

module.exports = {
  normalizeCountryCode,
  formatPhone
};
