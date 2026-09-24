// constants/categories.js
import { COLORS } from "./colors";
import { shadeColor } from "../lib/utils";

export const CATEGORIES = [
  { id: "food", name: "Food", icon: "fast-food" },
  { id: "transport", name: "Transport", icon: "car" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "bills", name: "Bills", icon: "receipt" },
  { id: "rent", name: "Rent", icon: "home" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "health", name: "Health", icon: "medkit" },
  { id: "salary", name: "Salary", icon: "cash" },
  { id: "other", name: "Other", icon: "ellipsis-horizontal" },
];

export const DEFAULT_CATEGORY_ICON = "pricetag-outline";

export function getCategoryIcon(categoryName) {
  const match = CATEGORIES.find((c) => c.name === categoryName);
  return match ? match.icon : DEFAULT_CATEGORY_ICON;
}

// Derives a distinct shade of the theme's primary color per category, so
// category charts stay in the app's existing color family instead of
// introducing a new, unrelated palette.
export function getCategoryColor(categoryName) {
  const index = CATEGORIES.findIndex((c) => c.name === categoryName);
  const safeIndex = index === -1 ? CATEGORIES.length : index;
  const total = CATEGORIES.length + 1;
  const percent = -35 + (safeIndex * 65) / (total - 1); // -35% (darker) .. +30% (lighter)
  return shadeColor(COLORS.primary, percent);
}
