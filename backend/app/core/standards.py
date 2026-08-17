from typing import Dict, Any, List

METHODOLOGY_METADATA = {
    "name": "EcoTrend Air Health Scoring Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Environmental Health Score (EHS) methodology for Air Quality metrics, anchored in official WHO 2021 Air Quality Guidelines and US EPA AQI breakpoints.",
    "attribution_notice": "Official reference thresholds are sourced from WHO 2021 guidelines and US EPA breakpoints. The 0–100 normalization curves, metric weighting scheme, and aggregate EHS formulas represent EcoTrend's project-defined scoring methodology and are not an official single-number index published by WHO or EPA.",
    "last_updated": "2026-08-17"
}

# Configurable Air Quality Standards & Epidemiological Weights
AIR_QUALITY_STANDARDS: Dict[str, Dict[str, Any]] = {
    "PM2.5": {
        "metric": "PM2.5",
        "unit": "µg/m³",
        "who_annual": 5.0,
        "who_24h": 15.0,
        "epa_good": 12.0,
        "epa_moderate": 35.4,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.35,
        "weight_rationale": "Highest weight (35%) assigned due to fine particulate matter's deep pulmonary and cardiovascular penetration, backed by extensive WHO epidemiological mortality studies."
    },
    "PM10": {
        "metric": "PM10",
        "unit": "µg/m³",
        "who_annual": 15.0,
        "who_24h": 45.0,
        "epa_good": 54.0,
        "epa_moderate": 154.0,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.20,
        "weight_rationale": "Weight (20%) reflects coarse particulate inhalation risks causing upper respiratory airway irritation and asthma exacerbation."
    },
    "NO2": {
        "metric": "NO2",
        "unit": "ppb",
        "who_annual": 10.0,
        "who_24h": 25.0, # converted/guideline
        "epa_good": 53.0,
        "epa_moderate": 100.0,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.15,
        "weight_rationale": "Weight (15%) accounts for traffic-related nitrogen dioxide exposure causing bronchial hyper-reactivity."
    },
    "O3": {
        "metric": "O3",
        "unit": "ppb",
        "who_annual": 60.0, # 8h seasonal
        "who_24h": 100.0, # 8h daily
        "epa_good": 54.0,
        "epa_moderate": 70.0,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.15,
        "weight_rationale": "Weight (15%) reflects ground-level photochemical ozone's strong oxidant effect on lung tissue during peak sunlight hours."
    },
    "SO2": {
        "metric": "SO2",
        "unit": "ppb",
        "who_annual": 40.0, # 24h limit
        "who_24h": 40.0,
        "epa_good": 35.0,
        "epa_moderate": 75.0,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.10,
        "weight_rationale": "Weight (10%) reflects industrial sulfur dioxide emissions leading to acute bronchoconstriction in asthmatics."
    },
    "CO": {
        "metric": "CO",
        "unit": "ppm",
        "who_annual": 4.0, # 24h limit
        "who_24h": 4.0,
        "epa_good": 4.4,
        "epa_moderate": 9.4,
        "standard_reference": "WHO_AQG_2021 / US_EPA_2024",
        "weight": 0.05,
        "weight_rationale": "Weight (5%) reflects carbon monoxide's lower baseline toxicity at ambient urban outdoor concentrations."
    },
    "AQI": {
        "metric": "AQI",
        "unit": "index",
        "who_annual": 50.0,
        "who_24h": 100.0,
        "epa_good": 50.0,
        "epa_moderate": 100.0,
        "standard_reference": "US_EPA_AQI_2024",
        "weight": 0.0, # Secondary composite metric, not double-counted in raw aggregate
        "weight_rationale": "Secondary composite metric evaluated as an indicator sub-score; excluded from primary sum to avoid double counting."
    }
}

SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Excellent",
        "color": "#10B981", # Emerald
        "health_impact": "Air quality meets strict WHO annual safety targets. Minimal or no risk to public health."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Good",
        "color": "#06B6D4", # Cyan
        "health_impact": "Air quality is satisfactory. Pollutants meet WHO 24h limits with little risk for general public."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Moderate",
        "color": "#F59E0B", # Amber
        "health_impact": "Air quality is acceptable; however, unusually sensitive individuals may experience slight respiratory discomfort."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "Poor",
        "color": "#F97316", # Orange
        "health_impact": "Pollution exceeds WHO recommended safety thresholds. Sensitive groups may experience health effects."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "Very Poor",
        "color": "#F43F5E", # Rose
        "health_impact": "Air quality exceeds 3x WHO guidelines. Increased likelihood of adverse health effects for general public."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical",
        "color": "#9333EA", # Purple
        "health_impact": "Hazardous air pollution levels triggering emergency health warnings for the entire population."
    }
]

def get_category_for_score(score: float) -> Dict[str, Any]:
    score_clamped = max(0.0, min(100.0, score))
    for cat in SCORE_CATEGORIES:
        if cat["min_score"] <= score_clamped <= cat["max_score"]:
            return cat
    return SCORE_CATEGORIES[-1]
