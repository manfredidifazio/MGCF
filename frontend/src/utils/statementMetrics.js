export function hasMeaningfulAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && Math.abs(amount) >= 0.005;
}

export function formatCurrencyAmount(value, formatter, options = {}) {
  const { signed = false, blankZero = true } = options;
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "";
  if (blankZero && !hasMeaningfulAmount(amount)) return "";

  const formatted = formatter.format(amount);
  return signed && amount > 0 ? `+${formatted}` : formatted;
}
