export function isPublishablePriceLabel(label: string): boolean {
  const trimmed = label.trim();
  return trimmed.length > 0 && !trimmed.startsWith("[ANDY:");
}