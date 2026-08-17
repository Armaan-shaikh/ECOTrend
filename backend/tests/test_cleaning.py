import pytest
from datetime import datetime, timezone
from app.engine.cleaning import DataCleaningPipeline

def test_sensor_error_code_rejection():
    raw_measurement = {
        "location_id": "loc_us_ny_nyc_manhattan",
        "domain": "air",
        "metric": "PM2.5",
        "value": 9999.0,
        "unit": "µg/m³",
        "timestamp": datetime.now(timezone.utc),
        "source": "TestSensor"
    }

    cleaned, logs = DataCleaningPipeline.clean_single_measurement(raw_measurement)
    assert cleaned["data_quality"] == "INVALID"
    assert len(logs) == 1
    assert logs[0]["rule_triggered"] == "SENSOR_ERROR_CODE_9999"

def test_negative_physical_value_rejection():
    raw_measurement = {
        "location_id": "loc_us_ny_nyc_manhattan",
        "domain": "air",
        "metric": "PM2.5",
        "value": -45.0,
        "unit": "µg/m³",
        "timestamp": datetime.now(timezone.utc),
        "source": "TestSensor"
    }

    cleaned, logs = DataCleaningPipeline.clean_single_measurement(raw_measurement)
    assert cleaned["data_quality"] == "INVALID"
    assert len(logs) == 1
    assert logs[0]["rule_triggered"] == "NEGATIVE_PHYSICAL_VALUE"

def test_zscore_outlier_detection():
    # Build series of normal readings with 1 extreme outlier
    measurements = []
    now = datetime.now(timezone.utc)
    for i in range(20):
        measurements.append({
            "location_id": "loc_test",
            "domain": "air",
            "metric": "PM2.5",
            "value": 25.0 + (i % 3),
            "unit": "µg/m³",
            "timestamp": now,
            "source": "Test"
        })
    # Inject outlier
    measurements.append({
        "location_id": "loc_test",
        "domain": "air",
        "metric": "PM2.5",
        "value": 500.0, # Extreme spike
        "unit": "µg/m³",
        "timestamp": now,
        "source": "Test"
    })

    cleaned_series, logs = DataCleaningPipeline.batch_clean_series(measurements)
    outlier_record = cleaned_series[-1]
    assert outlier_record["data_quality"] in ["SUSPECT", "INVALID"]
    assert len(logs) > 0
