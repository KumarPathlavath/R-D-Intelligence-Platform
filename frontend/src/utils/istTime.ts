/**
 * Indian Standard Time (IST, UTC+05:30) Frontend Utilities
 */

/**
 * Get current date adjusted to Indian Standard Time (UTC+05:30)
 */
export function getISTNow(): Date {
  const now = new Date();
  // Get time in UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // IST is UTC + 5.5 hours (19,800,000 ms)
  return new Date(utc + 3600000 * 5.5);
}

/**
 * Format live clock in IST: e.g. "15:47:30 IST"
 */
export function formatISTClock(date?: Date): string {
  const d = date || getISTNow();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds} IST`;
}

/**
 * Format date & time in IST: e.g. "28 Sep 2026, 15:47 IST"
 */
export function formatISTDateTime(isoOrDate?: string | Date): string {
  if (!isoOrDate) return `${formatISTClock()}`;
  try {
    let d: Date;
    if (typeof isoOrDate === 'string') {
      if (isoOrDate.includes('T')) {
        const parsed = new Date(isoOrDate);
        const utc = parsed.getTime() + parsed.getTimezoneOffset() * 60000;
        d = new Date(utc + 3600000 * 5.5);
      } else {
        d = new Date(isoOrDate);
      }
    } else {
      d = isoOrDate;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes} IST`;
  } catch {
    return `${isoOrDate} IST`;
  }
}

/**
 * Get relative time string comparing against IST
 * e.g. "Just now (15:48 IST)", "2 min ago (15:46 IST)", "1 hour ago (IST)", "2 days ago (26 Sep IST)"
 */
export function getRelativeTimeIST(isoOrDateStr?: string): string {
  if (!isoOrDateStr) return 'Just now (IST)';

  try {
    const nowIST = getISTNow();
    let targetIST: Date;

    if (isoOrDateStr.includes('T')) {
      const parsed = new Date(isoOrDateStr);
      const utc = parsed.getTime() + parsed.getTimezoneOffset() * 60000;
      targetIST = new Date(utc + 3600000 * 5.5);
    } else {
      targetIST = new Date(isoOrDateStr);
    }

    const diffMs = nowIST.getTime() - targetIST.getTime();
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    const hours = String(targetIST.getHours()).padStart(2, '0');
    const minutes = String(targetIST.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes} IST`;

    if (diffSecs < 45) {
      return `Just now · ${timeFormatted}`;
    } else if (diffSecs < 3600) {
      const m = Math.max(1, Math.floor(diffSecs / 60));
      return `${m} min ago (${timeFormatted})`;
    } else if (diffSecs < 86400) {
      const h = Math.floor(diffSecs / 3600);
      return `${h} hr${h > 1 ? 's' : ''} ago (${timeFormatted})`;
    } else {
      const days = Math.floor(diffSecs / 86400);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days}d ago (${targetIST.getDate()} ${months[targetIST.getMonth()]} IST)`;
    }
  } catch {
    return `${isoOrDateStr} (IST)`;
  }
}
