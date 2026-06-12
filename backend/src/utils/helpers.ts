export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function genOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `PS-${ts}${rand}`;
}

export function isStoreOpen(isOpenToggle: boolean, openTime: string, closeTime: string): boolean {
  if (!isOpenToggle) return false;
  if (!openTime || !closeTime) return isOpenToggle;

  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const currentTotal = istTime.getHours() * 60 + istTime.getMinutes();

  const [openH, openM] = openTime.split(":").map(Number);
  const openTotal = openH * 60 + (openM || 0);

  const [closeH, closeM] = closeTime.split(":").map(Number);
  const closeTotal = closeH * 60 + (closeM || 0);

  if (closeTotal < openTotal) {
    // Closes past midnight (e.g., 20:00 to 02:00)
    return currentTotal >= openTotal || currentTotal <= closeTotal;
  }

  return currentTotal >= openTotal && currentTotal <= closeTotal;
}
