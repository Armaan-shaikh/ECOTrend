import pytest
from app.engine.multi_domain import MultiDomainEngine, BASELINE_DOMAIN_WEIGHTS, CAUSATION_DISCLAIMER

def test_cepi_weights_sum():
    total_weight = sum(BASELINE_DOMAIN_WEIGHTS.values())
    assert abs(total_weight - 1.00) < 0.0001, "Baseline domain weights must sum to 1.00"

def test_cepi_all_domains_available():
    domain_scores = {
        "air": {"score": 80, "is_available": True},
        "water": {"score": 80, "is_available": True},
        "soil": {"score": 80, "is_available": True},
        "climate": {"score": 80, "is_available": True},
        "emissions": {"score": 80, "is_available": True},
        "noise": {"score": 80, "is_available": True}
    }
    res = MultiDomainEngine.calculate_cepi(domain_scores)
    assert res["cepi_score"] == 80
    assert res["available_domains_count"] == 6
    assert res["data_coverage_percent"] == 100.0
    assert res["weights_used"]["air"] == 20.0
    assert res["weights_used"]["noise"] == 10.0

def test_cepi_missing_domain_renormalization():
    # Noise domain missing (e.g. outside NYC) -> Must NOT penalize CEPI or turn into 0
    domain_scores = {
        "air": {"score": 80, "is_available": True},
        "water": {"score": 80, "is_available": True},
        "soil": {"score": 80, "is_available": True},
        "climate": {"score": 80, "is_available": True},
        "emissions": {"score": 80, "is_available": True},
        "noise": {"score": 0, "is_available": False}
    }
    res = MultiDomainEngine.calculate_cepi(domain_scores)
    assert res["cepi_score"] == 80
    assert res["available_domains_count"] == 5
    assert "noise" in res["missing_domains"]
    assert res["data_coverage_percent"] == 90.0
    # Re-normalized weights check: 20% out of 90% total = 22.2% for Air
    assert res["weights_used"]["air"] == 22.2

def test_spatial_temporal_alignment():
    rec_a = [
        {"location_id": "loc_1", "timestamp": "2026-08-01T00:00:00Z", "value": 10.0, "data_quality": "VALID"},
        {"location_id": "loc_1", "timestamp": "2026-08-02T00:00:00Z", "value": 15.0, "data_quality": "VALID"},
        {"location_id": "loc_2", "timestamp": "2026-08-01T00:00:00Z", "value": 20.0, "data_quality": "VALID"}
    ]
    rec_b = [
        {"location_id": "loc_1", "timestamp": "2026-08-01T00:00:00Z", "value": 2.0, "data_quality": "VALID"},
        {"location_id": "loc_1", "timestamp": "2026-08-02T00:00:00Z", "value": 3.0, "data_quality": "VALID"},
        {"location_id": "loc_3", "timestamp": "2026-08-01T00:00:00Z", "value": 5.0, "data_quality": "VALID"}
    ]

    p_a, p_b = MultiDomainEngine.align_time_series(rec_a, rec_b)
    assert len(p_a) == 2
    assert len(p_b) == 2
    assert p_a == [10.0, 15.0]
    assert p_b == [2.0, 3.0]

def test_cross_domain_correlation_insufficient_data():
    # n = 5 < 10 threshold -> INSUFFICIENT_DATA
    s1 = [12.0, 14.5, 18.2, 22.1, 25.4]
    s2 = [2.0, 3.0, 5.0, 7.0, 8.0]
    res = MultiDomainEngine.compute_cross_domain_correlation(s1, s2, "PM2.5", "NOISE_INCIDENTS")

    assert res["status"] == "INSUFFICIENT_DATA"
    assert res["sample_size"] == 5
    assert res["pearson_r"] is None
    assert res["disclaimer"] == CAUSATION_DISCLAIMER

def test_cross_domain_correlation_valid():
    # n = 12 >= 10 -> Valid correlation
    s1 = [10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0, 32.0]
    s2 = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
    res = MultiDomainEngine.compute_cross_domain_correlation(s1, s2, "MetricA", "MetricB")

    assert res["status"] == "VALID"
    assert res["sample_size"] == 12
    assert res["pearson_r"] == 1.0
    assert res["spearman_rho"] == 1.0
    assert res["is_statistically_significant"] is True
    assert res["disclaimer"] == CAUSATION_DISCLAIMER
