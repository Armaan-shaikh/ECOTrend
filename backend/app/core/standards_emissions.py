from typing import Dict, Any, List

EMISSIONS_STANDARDS: Dict[str, Dict[str, Any]] = {
    "CO2_PER_CAPITA": {
        "metric": "CO2_PER_CAPITA",
        "title": "Per Capita CO2 Emissions",
        "unit": "tCO2/capita",
        "standard_reference": "IPCC AR6 Paris Agreement 1.5°C Net-Zero Target",
        "reference_type": "REGULATORY_LIMIT",
        "weight": 0.40,
        "optimal_max": 2.0,
        "moderate_max": 4.7,
        "critical_max": 15.0,
        "weight_rationale": "Highest weight (40%) assigned to evaluate personal carbon footprint alignment with Paris 1.5°C net-zero budget."
    },
    "CO2_PPM": {
        "metric": "CO2_PPM",
        "title": "Atmospheric CO2 Concentration",
        "unit": "ppm",
        "standard_reference": "NOAA Global Monitoring Laboratory / IPCC AR6",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.35,
        "optimal_max": 350.0,
        "moderate_max": 425.0,
        "critical_max": 600.0,
        "weight_rationale": "Weight (35%) assigned to track global atmospheric CO2 concentration relative to pre-industrial 280 ppm and 350 ppm target."
    },
    "CO2E_TOTAL": {
        "metric": "CO2E_TOTAL",
        "title": "Total GHG Emissions",
        "unit": "MtCO2e",
        "standard_reference": "UNFCCC National Greenhouse Gas Inventories",
        "reference_type": "REGULATORY_LIMIT",
        "weight": 0.25,
        "optimal_max": 10.0,
        "moderate_max": 100.0,
        "critical_max": 1000.0,
        "weight_rationale": "Weight (25%) assigned for national/regional total greenhouse gas decarbonization trajectory."
    }
}

EMISSIONS_SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Paris 1.5°C Aligned",
        "color": "#10B981",
        "health_impact": "Emissions meet strict IPCC 1.5°C Paris Agreement net-zero per capita targets."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Moderate Footprint",
        "color": "#06B6D4",
        "health_impact": "Per capita emissions align with global average targets."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Elevated Footprint",
        "color": "#F59E0B",
        "health_impact": "Emissions exceed recommended Paris 1.5°C decarbonization budget."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "High Footprint",
        "color": "#F97316",
        "health_impact": "High greenhouse gas intensity requiring accelerated energy transition."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "Very High Footprint",
        "color": "#F43F5E",
        "health_impact": "Very high fossil fuel emission intensity."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical Intensity",
        "color": "#9333EA",
        "health_impact": "Extreme per capita fossil emission intensity exceeding 3x global average."
    }
]

EMISSIONS_METHODOLOGY_METADATA = {
    "name": "EcoTrend Emissions Sustainability Index Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Emissions Sustainability Index anchored in IPCC AR6 Working Group I 1.5°C Paris Agreement Pathways and UNFCCC Protocols.",
    "attribution_notice": "Official reference targets are sourced from IPCC AR6 WG1 and UNFCCC inventories. The 0–100 normalization curves and weighting scheme represent EcoTrend's project-defined scoring methodology and are not an official IPCC index.",
    "last_updated": "2026-08-17"
}

def get_emissions_category(score: float) -> Dict[str, Any]:
    score_int = int(round(max(0.0, min(100.0, score))))
    for cat in EMISSIONS_SCORE_CATEGORIES:
        if cat["min_score"] <= score_int <= cat["max_score"]:
            return cat
    return EMISSIONS_SCORE_CATEGORIES[-1]
