// Always compute "today" in Asia/Bangkok regardless of where the code runs.
// `new Date().toISOString().split('T')[0]` returns UTC date, which becomes
// yesterday during Bangkok 00:00–06:59 (UTC behind 7h).

export function todayBangkok(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}
