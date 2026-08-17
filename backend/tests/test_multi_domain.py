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
