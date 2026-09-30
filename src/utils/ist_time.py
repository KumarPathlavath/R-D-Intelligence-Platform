"""
Indian Standard Time (IST) Utility Module
Provides timezone-aware datetime helpers for UTC+05:30 (IST).
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

# Indian Standard Time is UTC + 05:30
IST_OFFSET = timedelta(hours=5, minutes=30)
IST = timezone(IST_OFFSET, name="IST")


def get_ist_now() -> datetime:
    """Return the current datetime in Indian Standard Time (IST)."""
    return datetime.now(IST)


def get_ist_now_iso() -> str:
    """Return current IST timestamp in ISO 8601 format."""
    return get_ist_now().isoformat()


def get_ist_date_str() -> str:
    """Return current IST date string formatted as YYYY-MM-DD."""
    return get_ist_now().strftime("%Y-%m-%d")


def get_ist_formatted(dt: Optional[datetime] = None) -> str:
    """Return formatted datetime in IST: '28 Sep 2026, 15:47:22 IST'."""
    if dt is None:
        dt = get_ist_now()
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc).astimezone(IST)
    else:
        dt = dt.astimezone(IST)
    return dt.strftime("%d %b %Y, %H:%M:%S IST")


def get_ist_time_str(dt: Optional[datetime] = None) -> str:
    """Return time only in IST: '15:47 IST'."""
    if dt is None:
        dt = get_ist_now()
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc).astimezone(IST)
    else:
        dt = dt.astimezone(IST)
    return dt.strftime("%H:%M IST")


def get_ist_relative_time(iso_or_date_str: str) -> str:
    """
    Calculate human-readable relative time string compared to current IST.
    Examples: 'Just now (IST)', '2 min ago (15:45 IST)', '1 hour ago (IST)'.
    """
    if not iso_or_date_str:
        return "Just now (IST)"
    
    try:
        if "T" in iso_or_date_str:
            # ISO timestamp
            clean_str = iso_or_date_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            dt_ist = dt.astimezone(IST)
        else:
            # YYYY-MM-DD
            dt_naive = datetime.strptime(iso_or_date_str, "%Y-%m-%d")
            dt_ist = dt_naive.replace(tzinfo=IST)
            
        now_ist = get_ist_now()
        diff = now_ist - dt_ist
        seconds = max(0, int(diff.total_seconds()))
        
        if seconds < 45:
            return f"Just now ({dt_ist.strftime('%H:%M')} IST)"
        elif seconds < 3600:
            minutes = max(1, seconds // 60)
            return f"{minutes} min ago ({dt_ist.strftime('%H:%M')} IST)"
        elif seconds < 86400:
            hours = seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago ({dt_ist.strftime('%H:%M')} IST)"
        else:
            days = seconds // 86400
            return f"{days} day{'s' if days > 1 else ''} ago ({dt_ist.strftime('%d %b')} IST)"
    except Exception:
        return f"{iso_or_date_str} (IST)"
