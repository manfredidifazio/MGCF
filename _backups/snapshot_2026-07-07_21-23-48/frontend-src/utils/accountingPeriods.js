export const ACCOUNTING_START_YEAR = 2024;

export function accountingYears(...dateGroups) {
  const currentYear = new Date().getFullYear();
  const values = new Set();

  for (let year = ACCOUNTING_START_YEAR; year <= currentYear; year += 1) {
    values.add(String(year));
  }

  dateGroups.flat().forEach((value) => {
    const year = String(value ?? "").slice(0, 4);
    if (/^\d{4}$/.test(year)) values.add(year);
  });

  return [...values].sort((first, second) => Number(first) - Number(second));
}
