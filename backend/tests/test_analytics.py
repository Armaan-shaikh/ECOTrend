import pytest
from datetime import datetime, timedelta, timezone
from app.engine.analysis import HistoricalAnalyticsEngine

def test_linear_trend_improving():
    # Build improving time-series (values decreasing over time)
    measurements = []
    start_dt = datetime.now(timezone.utc) - timedelta(days=30)
    for i in range(30):
        measurements.append({
            "location_id": "loc_test",
            "domain": "air",
            "metric": "PM2.5",
            "value": 60.0 - (i * 1.5), # Decreasing trend
            "unit": "µg/m³",
            "timestamp": (start_dt + timedelta(days=i)).isoformat(),
            "source": "Test",
            "data_quality": "VALID"
        })

    result = HistoricalAnalyticsEngine.compute_analytics(
        measurements=measurements,
        location_id="loc_test",
        location_name="Test Station",
        metric="PM2.5",
        unit="µg/m³"
    )

    assert result["linear_trend"]["direction"] == "IMPROVING"
    assert result["linear_trend"]["slope"] < 0
    assert result["rate_of_change_percent"] < 0
    assert result["volatility"]["mean"] > 0
