from datetime import UTC,datetime


def utcnow() -> datetime:
    """Return naive UTC for compatibility with the existing database schema."""
    return datetime.now(UTC).replace(tzinfo=None)



def ensure_naive_utc(value: datetime) -> datetime:
    if not isinstance(value, datetime):
        raise ValueError("datetime required")
    if value.tzinfo is None:
        return value
    if value.tzinfo.utcoffset(value) != UTC.utcoffset(None):
        raise ValueError("non-UTC timezone")
    return value.astimezone(UTC).replace(tzinfo=None)
