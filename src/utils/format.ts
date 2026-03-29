export function formatNumber(value: number): string {
  if (isNaN(value)) return '';
  if (Math.abs(value) < 10000) {
    if (Number.isInteger(value)) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    const decimalPart = value.toString().split('.')[1];
    const firstDecimalDigit = decimalPart ? decimalPart[0] : '0';
    const formatted =
      firstDecimalDigit === '0' ? value.toFixed(3) : value.toFixed(2);
    return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatRate(rateIn: number, rateOut: number): string {
  if (!rateIn || !rateOut) return 'N/A';
  const ratio = rateOut / rateIn;
  return formatNumber(ratio);
}

export function formatTotal(
  amount: number,
  rateIn: number,
  rateOut: number,
): string {
  if (!rateIn || !rateOut || !amount) return '';
  const total = (amount * rateOut) / rateIn;
  return formatNumber(total);
}
