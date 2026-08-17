import time
import pytest
from app.core.cache import cache_manager, cached_endpoint, make_cache_key

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

def test_cache_miss_executes_function():
    call_count = 0

    @cached_endpoint(prefix="test_miss", ttl_seconds=60)
    def compute_data(location_id: str):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "score": 85}

    res1 = compute_data("loc_us_ny")
    assert call_count == 1
    assert res1 == {"location_id": "loc_us_ny", "score": 85}

def test_cache_hit_avoids_repeated_execution():
    call_count = 0

    @cached_endpoint(prefix="test_hit", ttl_seconds=60)
    def compute_data(location_id: str):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "score": 85}

    res1 = compute_data("loc_us_ny")
    res2 = compute_data("loc_us_ny")
    assert call_count == 1
    assert res1 == res2

def test_ttl_expiration_causes_recomputation():
    call_count = 0

    @cached_endpoint(prefix="test_ttl", ttl_seconds=1)
    def compute_data(location_id: str):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "timestamp": time.time()}

    res1 = compute_data("loc_us_ny")
    assert call_count == 1

    time.sleep(1.1)

    res2 = compute_data("loc_us_ny")
    assert call_count == 2

def test_cache_keys_differ_for_different_parameters():
    call_count = 0

    @cached_endpoint(prefix="test_params", ttl_seconds=60)
    def compute_data(location_id: str, metric: str = "PM2.5"):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "metric": metric, "count": call_count}

    res1 = compute_data("loc_us_ny", metric="PM2.5")
    res2 = compute_data("loc_us_dc", metric="PM2.5")
    res3 = compute_data("loc_us_ny", metric="DO")

    assert call_count == 3
    assert res1["location_id"] == "loc_us_ny"
    assert res2["location_id"] == "loc_us_dc"
    assert res3["metric"] == "DO"

def test_explicit_invalidation_removes_cached_values():
    call_count = 0

    @cached_endpoint(prefix="test_inv", ttl_seconds=60)
    def compute_data(location_id: str):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "count": call_count}

    res1 = compute_data("loc_us_ny")
    assert call_count == 1

    cache_manager.invalidate_prefix("test_inv")

    res2 = compute_data("loc_us_ny")
    assert call_count == 2

def test_redis_failure_fallback():
    # Force _use_redis = False to simulate Redis connection failure / fallback
    original_use_redis = cache_manager._use_redis
    cache_manager._use_redis = False

    call_count = 0

    @cached_endpoint(prefix="test_fallback", ttl_seconds=60)
    def compute_data(location_id: str):
        nonlocal call_count
        call_count += 1
        return {"location_id": location_id, "score": 90}

    res1 = compute_data("loc_us_ny")
    res2 = compute_data("loc_us_ny")

    assert call_count == 1
    assert res1 == {"location_id": "loc_us_ny", "score": 90}

    cache_manager._use_redis = original_use_redis

def test_exceptions_are_not_cached():
    call_count = 0

    @cached_endpoint(prefix="test_error", ttl_seconds=60)
    def failing_func():
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise ValueError("Simulated pipeline failure")
        return {"status": "ok"}

    with pytest.raises(ValueError, match="Simulated pipeline failure"):
        failing_func()

    assert call_count == 1

    # Second call after failure must execute underlying function rather than returning cached error
    res2 = failing_func()
    assert call_count == 2
    assert res2 == {"status": "ok"}

def test_user_specific_responses_not_cached():
    call_count = 0

    @cached_endpoint(prefix="test_user", ttl_seconds=60, is_user_specific=True)
    def get_user_dashboard(user_id: str):
        nonlocal call_count
        call_count += 1
        return {"user_id": user_id, "call_count": call_count}

    res1 = get_user_dashboard("user_123")
    res2 = get_user_dashboard("user_123")

    assert call_count == 2
    assert res1["call_count"] == 1
    assert res2["call_count"] == 2

def test_cache_serialization_preserves_structure():
    call_count = 0

    @cached_endpoint(prefix="test_struct", ttl_seconds=60)
    def get_nested_structure():
        nonlocal call_count
        call_count += 1
        return {
            "overall_score": 85,
            "domains": ["air", "water", "soil"],
            "subscores": {"air": {"score": 80, "is_valid": True}}
        }

    res1 = get_nested_structure()
    res2 = get_nested_structure()

    assert call_count == 1
    assert res2 == res1
    assert isinstance(res2["domains"], list)
    assert res2["subscores"]["air"]["is_valid"] is True
