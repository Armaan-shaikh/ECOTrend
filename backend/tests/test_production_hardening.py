import os
import time
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI, Response, status

from app.core.cache import cache_manager, cached_endpoint
from app.core.database import get_db
from app.api.router import api_router
from app.models.measurement import EnvironmentalMeasurement, DataQualityLog
from app.models.location import Location

# Setup test app for router testing
app = FastAPI()
app.include_router(api_router, prefix="/api/v1")
client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_caches_before_test():
    cache_manager.clear()
    yield
    cache_manager.clear()

# Cache Tests (Step 1)
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


# Health Probe Tests (Step 2)

def test_liveness_returns_200():
    res = client.get("/api/v1/health/liveness")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "alive"
    assert "service" in data
    assert "version" in data

def test_liveness_performs_zero_db_redis_external_calls():
    with patch("sqlalchemy.orm.Session.execute") as mock_db, \
         patch("app.core.cache.CacheManager.get") as mock_redis, \
         patch("httpx.AsyncClient.get") as mock_http:
        res = client.get("/api/v1/health/liveness")
        assert res.status_code == 200
        mock_db.assert_not_called()
        mock_redis.assert_not_called()
        mock_http.assert_not_called()

def test_readiness_reports_healthy_dependencies():
    mock_db = MagicMock()
    mock_db.execute().scalar.return_value = 1

    app.dependency_overrides[get_db] = lambda: mock_db
    res = client.get("/api/v1/health/readiness")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert data["dependencies"]["database"] == "ok"
    assert "redis" in data["dependencies"]
    assert "external_apis" in data["dependencies"]

def test_db_failure_reflected_in_readiness_not_liveness():
    mock_db = MagicMock()
    mock_db.execute.side_effect = Exception("DB Connection Lost")

    res_live = client.get("/api/v1/health/liveness")
    assert res_live.status_code == 200

    app.dependency_overrides[get_db] = lambda: mock_db
    res_ready = client.get("/api/v1/health/readiness")
    app.dependency_overrides.clear()

    assert res_ready.status_code == 503
    data = res_ready.json()
    assert data["status"] == "not_ready"
    assert data["dependencies"]["database"] == "unavailable"

def test_redis_failure_reflected_in_readiness_not_liveness():
    mock_db = MagicMock()
    mock_db.execute().scalar.return_value = 1

    with patch("app.core.cache.CacheManager.is_redis_active", return_value=False):
        app.dependency_overrides[get_db] = lambda: mock_db
        res_ready = client.get("/api/v1/health/readiness")
        app.dependency_overrides.clear()

        assert res_ready.status_code == 200
        data = res_ready.json()
        assert data["dependencies"]["redis"] in ["degraded", "disabled"]

def test_readiness_does_not_expose_secrets():
    mock_db = MagicMock()
    mock_db.execute().scalar.return_value = 1

    app.dependency_overrides[get_db] = lambda: mock_db
    res = client.get("/api/v1/health/readiness")
    app.dependency_overrides.clear()

    text_resp = res.text.lower()
    assert "password" not in text_resp
    assert "secret" not in text_resp
    assert "postgresql://" not in text_resp

def test_overall_health_endpoint():
    mock_db = MagicMock()
    mock_db.execute().scalar.return_value = 1

    app.dependency_overrides[get_db] = lambda: mock_db
    res = client.get("/api/v1/health")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "readiness" in data

def test_health_routes_registered_under_prefix():
    res_liveness = client.get("/api/v1/health/liveness")
    res_readiness = client.get("/api/v1/health/readiness")
    assert res_liveness.status_code == 200
    assert res_readiness.status_code in [200, 503]


# Database Index Audit Tests (Step 3)

def test_measurement_index_definitions():
    indexes = {idx.name: [c.name for c in idx.columns] for idx in EnvironmentalMeasurement.__table__.indexes}
    assert "idx_meas_domain_loc_time" in indexes
    assert indexes["idx_meas_domain_loc_time"] == ["domain", "location_id", "timestamp"]

    assert "idx_meas_domain_metric_time" in indexes
    assert indexes["idx_meas_domain_metric_time"] == ["domain", "metric", "timestamp"]

def test_location_spatial_index_definition():
    indexes = {idx.name: [c.name for c in idx.columns] for idx in Location.__table__.indexes}
    assert "idx_location_lat_lon" in indexes
    assert indexes["idx_location_lat_lon"] == ["latitude", "longitude"]

def test_no_duplicate_index_names():
    all_indexes = []
    all_indexes.extend([idx.name for idx in EnvironmentalMeasurement.__table__.indexes])
    all_indexes.extend([idx.name for idx in Location.__table__.indexes])

    assert len(all_indexes) == len(set(all_indexes))

def test_valid_indexed_columns():
    table_cols = set(EnvironmentalMeasurement.__table__.columns.keys())
    for idx in EnvironmentalMeasurement.__table__.indexes:
        for c in idx.columns:
            assert c.name in table_cols


# Docker Containerization & Environment Audit Tests (Step 4)

def test_docker_files_exist():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    assert os.path.exists(os.path.join(base_dir, "Dockerfile.backend"))
    assert os.path.exists(os.path.join(base_dir, "Dockerfile.frontend"))
    assert os.path.exists(os.path.join(base_dir, "docker-compose.yml"))
    assert os.path.exists(os.path.join(base_dir, ".env.example"))
    assert os.path.exists(os.path.join(base_dir, ".dockerignore"))

def test_docker_compose_services_configured():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    compose_path = os.path.join(base_dir, "docker-compose.yml")
    with open(compose_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "backend:" in content
    assert "frontend:" in content
    assert "db:" in content
    assert "redis:" in content

def test_docker_compose_persistent_volumes():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    compose_path = os.path.join(base_dir, "docker-compose.yml")
    with open(compose_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "pgdata:" in content
    assert "redisdata:" in content

def test_docker_compose_health_checks_and_restart_policies():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    compose_path = os.path.join(base_dir, "docker-compose.yml")
    with open(compose_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "healthcheck:" in content
    assert "restart: unless-stopped" in content
    assert "/api/v1/health/liveness" in content

def test_env_example_variables_represented():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_path = os.path.join(base_dir, ".env.example")
    with open(env_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "POSTGRES_DB=" in content
    assert "POSTGRES_USER=" in content
    assert "REDIS_HOST=" in content
    assert "DATABASE_URL=" in content
    assert "NEXT_PUBLIC_API_URL=" in content

def test_no_hardcoded_secrets_in_docker_files():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    compose_path = os.path.join(base_dir, "docker-compose.yml")
    with open(compose_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify passwords are env var references rather than plain string credentials
    assert "${POSTGRES_PASSWORD" in content
