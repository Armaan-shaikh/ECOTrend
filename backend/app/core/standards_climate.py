from typing import Dict, Any, List

CLIMATE_STANDARDS: Dict[str, Dict[str, Any]] = {
    "T_ANOMALY": {
        "metric": "T_ANOMALY",
        "title": "Temperature Anomaly",
        "unit": "°C",
        "standard_reference": "WMO Climatological Normals / IPCC AR6 Framework",
        "reference_type": "PROJECT_DEFINED_METHODOLOGY",
        "weight": 0.30,
        "optimal_max": 0.5,
        "moderate_max": 1.5,
        "critical_max": 4.0,
        "weight_rationale": "Highest weight (30%) assigned due to direct indication of long-term climate warming departure from baseline."
    },
    "T2M": {
        "metric": "T2M",
        "title": "Air Temperature",
        "unit": "°C",
        "standard_reference": "WMO Comfort & Thermal Stress Normals",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.25,
        "optimal_min": 15.0,
        "optimal_max": 25.0,
        "moderate_min": 10.0,
        "moderate_max": 30.0,
        "weight_rationale": "Weight (25%) assigned for human thermal comfort and physiological heat stress index."
    },
    "PRECIP": {
        "metric": "PRECIP",
        "title": "Precipitation",
        "unit": "mm",
        "standard_reference": "NOAA Climate Extremes Index (Drought / Flood)",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.20,
        "optimal_min": 1.0,
        "optimal_max": 25.0,
        "moderate_max": 75.0,
        "critical_max": 150.0,
        "weight_rationale": "Weight (20%) assigned for hydrological risk balance (drought vs heavy rain extremes)."
    },
    "RH2M": {
        "metric": "RH2M",
        "title": "Relative Humidity",
        "unit": "%",
        "standard_reference": "WMO Biometeorological Guidelines",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.15,
        "optimal_min": 35.0,
        "optimal_max": 65.0,
        "moderate_min": 25.0,
        "moderate_max": 75.0,
        "weight_rationale": "Weight (15%) assigned for evaporative capacity and indoor/outdoor air moisture."
    },
    "WS10M": {
        "metric": "WS10M",
        "title": "Wind Speed",
        "unit": "m/s",
        "standard_reference": "Beaufort Wind Scale / WMO Wind Normals",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.10,
        "optimal_min": 1.0,
        "optimal_max": 8.0,
        "moderate_max": 15.0,
        "critical_max": 25.0,
        "weight_rationale": "Weight (10%) assigned for atmospheric dispersion and storm gale risk."
    }
}

CLIMATE_SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Optimal",
        "color": "#10B981",
        "health_impact": "Climate conditions are within optimal WMO comfort targets with minimal baseline temperature anomaly."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Favorable",
        "color": "#06B6D4",
        "health_impact": "Climate parameters remain favorable. Temperature anomaly is under 1.5°C."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Moderate",
        "color": "#F59E0B",
        "health_impact": "Moderate thermal stress or seasonal precipitation departure from historical baseline."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "Unfavorable",
        "color": "#F97316",
        "health_impact": "Substantial climate anomaly or adverse weather extremes affecting comfort."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "Severe Stress",
        "color": "#F43F5E",
        "health_impact": "Significant heatwave, severe drought, or intense gale conditions."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical Extreme",
        "color": "#9333EA",
        "health_impact": "Extreme weather emergency (severe thermal wave, flooding precipitation, or storm winds)."
    }
]

CLIMATE_METHODOLOGY_METADATA = {
    "name": "EcoTrend Climate Index Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Climate Index methodology anchored in official WMO Climatological Normals Guidelines (WMO-No. 1203) and NOAA Climate Extremes Index.",
    "attribution_notice": "Official reference thresholds are sourced from WMO Climatological Normals and NOAA Climate Extremes. The 0–100 normalization curves and weighting scheme represent EcoTrend's project-defined scoring methodology and are not an official WMO index.",
    "last_updated": "2026-08-17"
}

def get_climate_category(score: float) -> Dict[str, Any]:
    score_int = int(round(max(0.0, min(100.0, score))))
    for cat in CLIMATE_SCORE_CATEGORIES:
        if cat["min_score"] <= score_int <= cat["max_score"]:
            return cat
    return CLIMATE_SCORE_CATEGORIES[-1]
