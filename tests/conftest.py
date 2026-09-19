import pytest

from ingress_security import PUBLIC_INGRESS_LIMITER


@pytest.fixture(autouse=True)
def clear_public_ingress_limiter():
    """Isolate tests from shared in-process SlidingWindowLimiter state."""
    PUBLIC_INGRESS_LIMITER.clear()
    yield
    PUBLIC_INGRESS_LIMITER.clear()
