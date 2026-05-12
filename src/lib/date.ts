export function nowIso() {
  return new Date().toISOString();
}

export function todayOffset(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isOverdue(date?: string) {
  return Boolean(date && date < todayOffset(0));
}

export function isFuture(date?: string) {
  return Boolean(date && date > todayOffset(0));
}
