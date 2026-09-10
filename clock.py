from datetime import UTC,datetime


def utcnow() -> datetime:
    """Return naive UTC for compatibility with the existing database schema."""
    return datetime.now(UTC).replace(tzinfo=None)
