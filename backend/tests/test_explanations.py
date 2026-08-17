import pytest
from app.engine.explanations.insight_engine import EnvironmentalInsightEngine
from app.engine.explanations.trend_explainer import TrendExplainer
from app.engine.explanations.forecast_explainer import ForecastExplainer
from app.engine.explanations.score_explainer import ScoreExplainer
from app.engine.explanations.metric_explainer import MetricExplainer

def test_deterministic_output_consistency():
    analytics = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "total_observations": 30,
        "rate_of_change_percent": -12.4,
        "linear_trend": {"direction": "IMPROVING", "r_squared": 0.82, "slope": -0.15},
        "anomalies": []
    }
    forecast = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "horizon": "1_YEAR",
        "champion_model": "SARIMA(1,1,1)(1,0,0)[7]",
        "projections": [
            {"baseline_value": 20.0, "ci_95_lower": 15.0, "ci_95_upper": 25.0}
        ]
    }
    ehs = {
        "overall_ehs": 78,
        "category": "Good",
        "primary_pollutant_driver": "PM2.5",
        "data_coverage_percent": 100.0
    }

    report1 = EnvironmentalInsightEngine.generate_location_report("New York", analytics, forecast, ehs)
    report2 = EnvironmentalInsightEngine.generate_location_report("New York", analytics, forecast, ehs)

    # Identical inputs MUST produce 100% identical report strings (no LLM randomness)
    assert report1["summary"] == report2["summary"]
    assert report1["historical_trend"] == report2["historical_trend"]
    assert report1["forecast_outlook"] == report2["forecast_outlook"]

def test_trend_explainer_improving_and_weak_confidence():
    analytics_strong = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "total_observations": 30,
        "rate_of_change_percent": -15.0,
        "linear_trend": {"direction": "IMPROVING", "r_squared": 0.85, "slope": -0.2}
    }
    text_strong = TrendExplainer.explain_trend(analytics_strong)
    assert "decreased" in text_strong
    assert "improving trend" in text_strong
    assert "strong statistical consistency" in text_strong

    analytics_weak = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "total_observations": 30,
        "rate_of_change_percent": +8.0,
        "linear_trend": {"direction": "DEGRADING", "r_squared": 0.12, "slope": +0.1}
    }
    text_weak = TrendExplainer.explain_trend(analytics_weak)
    assert "increased" in text_weak
    assert "low statistical confidence" in text_weak

def test_forecast_explainer_non_certainty():
    forecast_data = {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "horizon": "1_YEAR",
        "champion_model": "Holt-Winters",
        "projections": [
            {"baseline_value": 22.0, "ci_95_lower": 18.0, "ci_95_upper": 26.0},
            {"baseline_value": 24.0, "ci_95_lower": 17.0, "ci_95_upper": 31.0}
        ]
    }

    text = ForecastExplainer.explain_forecast_outlook(forecast_data)
    assert "Under the baseline scenario" in text
    assert "projected to" in text
    assert "estimated 95% confidence uncertainty range" in text

def test_score_explainer_attribution():
    ehs_data = {
        "overall_ehs": 62,
        "category": "Moderate",
        "primary_pollutant_driver": "PM2.5",
        "data_coverage_percent": 100.0
    }

    score_text = ScoreExplainer.explain_score(ehs_data)
    assert "EcoTrend's standards-aligned Air Quality Health Score is 62/100" in score_text
    assert "PM2.5" in score_text

    attr_note = ScoreExplainer.get_attribution_note()
    assert "EcoTrend's 0–100 Environmental Health Score (EHS) is a project-defined scoring methodology" in attr_note

def test_metric_glossary_definitions():
    pm25_def = MetricExplainer.get_metric_explanation("PM2.5")
    assert "Fine Particulate Matter" in pm25_def["title"]
    assert "2.5 micrometers" in pm25_def["definition"]

    all_defs = MetricExplainer.get_all_metric_definitions()
    assert len(all_defs) >= 6
