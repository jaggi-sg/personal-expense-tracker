// src/utils/smartSearch.js
// Parses natural language search strings into structured filter criteria
// Examples: ">500", "<100", "travel 2026", "pending march", "amex >200 paid"

const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const STATUSES = ['paid', 'pending', 'overdue', 'skipped'];

/**
 * Parse a raw search string into a structured filter object.
 * Returns: { text, minAmount, maxAmount, status, month, year, tokens }
 */
export function parseSmartSearch(raw) {
  if (!raw || !raw.trim()) return null;

  const result = {
    text: null,
    minAmount: null,
    maxAmount: null,
    status: null,
    month: null,
    year: null,
  };

  const tokens = raw.trim().split(/\s+/);
  const textParts = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();

    // Amount: >500, >=500, <100, <=100, =250
    const amountMatch = token.match(/^([><]=?|=)(\d+(?:\.\d+)?)$/);
    if (amountMatch) {
      const op  = amountMatch[1];
      const val = parseFloat(amountMatch[2]);
      if (op === '>' || op === '>=') result.minAmount = op === '>=' ? val : val + 0.01;
      else if (op === '<' || op === '<=') result.maxAmount = op === '<=' ? val : val - 0.01;
      else if (op === '=') { result.minAmount = val; result.maxAmount = val; }
      continue;
    }

    // Status keywords
    if (STATUSES.includes(lower)) {
      result.status = lower.toUpperCase();
      continue;
    }

    // Month names
    if (MONTHS[lower] !== undefined) {
      result.month = MONTHS[lower];
      continue;
    }

    // 4-digit year
    if (/^\d{4}$/.test(token)) {
      result.year = parseInt(token);
      continue;
    }

    // Everything else is free-text
    textParts.push(token);
  }

  if (textParts.length > 0) result.text = textParts.join(' ');
  return result;
}

/**
 * Apply a parsed smart search to a list of expenses.
 */
export function applySmartSearch(expenses, parsed) {
  if (!parsed) return expenses;

  return expenses.filter(e => {
    // Text match (description, category, by, paymentType)
    if (parsed.text) {
      const needle = parsed.text.toLowerCase();
      const haystack = [e.description, e.category, e.by, e.paymentType, e.trip]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    // Amount range
    if (parsed.minAmount !== null && e.amount < parsed.minAmount) return false;
    if (parsed.maxAmount !== null && e.amount > parsed.maxAmount) return false;

    // Status
    if (parsed.status && e.status !== parsed.status) return false;

    // Month
    if (parsed.month !== null) {
      const m = new Date(e.date + 'T00:00:00Z').getUTCMonth() + 1;
      if (m !== parsed.month) return false;
    }

    // Year
    if (parsed.year !== null) {
      const yr = new Date(e.date + 'T00:00:00Z').getUTCFullYear();
      if (yr !== parsed.year) return false;
    }

    return true;
  });
}

/**
 * Generate a human-readable description of the active smart filters.
 */
export function describeSmartSearch(parsed) {
  if (!parsed) return null;
  const parts = [];
  if (parsed.text)       parts.push('"' + parsed.text + '"');
  if (parsed.minAmount !== null) parts.push('>' + parsed.minAmount.toFixed(0));
  if (parsed.maxAmount !== null) parts.push('<' + parsed.maxAmount.toFixed(0));
  if (parsed.status)     parts.push(parsed.status);
  if (parsed.month)      parts.push(Object.keys(MONTHS).find(k => MONTHS[k] === parsed.month && k.length > 3) || '');
  if (parsed.year)       parts.push(String(parsed.year));
  return parts.filter(Boolean).join(' + ') || null;
}