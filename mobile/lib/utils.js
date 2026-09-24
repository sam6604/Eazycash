export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// example: 125000 👉 ₹1,25,000
export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

export function getMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

// Lightens (positive percent) or darkens (negative percent) a hex color.
// Used to derive a small palette of shades from the app's existing primary
// color, rather than introducing a new, unrelated color palette.
export function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amount = Math.round(2.55 * percent);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}
