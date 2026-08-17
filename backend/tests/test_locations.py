import pytest
from app.data_sources.air.mock_seed import SEED_LOCATIONS

def test_seed_location_hierarchy():
    # Verify spatial resolution hierarchy: Country -> State -> City -> Station
    levels = {loc["level"] for loc in SEED_LOCATIONS}
    assert "COUNTRY" in levels
    assert "STATE" in levels
    assert "CITY" in levels
    assert "STATION" in levels

def test_location_parent_linking():
    station = [loc for loc in SEED_LOCATIONS if loc["id"] == "loc_us_ny_nyc_manhattan"][0]
    assert station["parent_id"] == "loc_us_ny_nyc"
    assert station["level"] == "STATION"
    assert station["country_code"] == "US"
