/** Format money as on the trade price list: whole amounts without pence (e.g. £120), otherwise two decimals. */
export function formatMoney(value: string | number, currency = "GBP") {
  const n = Number(value);
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n);
}
