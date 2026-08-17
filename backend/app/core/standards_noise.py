from typing import Dict, Any, List

NOISE_STANDARDS: Dict[str, Dict[str, Any]] = {
    "NOISE_INCIDENTS": {
        "metric": "NOISE_INCIDENTS",
        "title": "Acoustic Noise Incidents",
        "unit": "incidents/day",
        "standard_reference": "EcoTrend Acoustic Disturbance Index v1.0",
        "reference_type": "PROJECT_DEFINED_METHODOLOGY",
        "weight": 1.00,
        "optimal_max": 0.0,
        "favorable_max": 2.0,
        "moderate_max": 5.0,
        "elevated_max": 10.0,
        "weight_rationale": "Primary measured metric (100% weight) tracking localized geocoded ambient noise disturbance reports."
    }
}

CONTEXTUAL_ACOUSTIC_DECIBEL_GUIDELINES = {
    "WHO_2018_LDEN": {
        "standard": "WHO Environmental Noise Guidelines (2018)",
        "limit_value": 53.0,
        "unit": "dBA",
        "applicability_note": "Contextual sound pressure guideline for road traffic noise. NOT directly applicable to incident report counts."
    },
    "WHO_2018_LNIGHT": {
        "standard": "WHO Night Noise Guidelines for Europe",
        "limit_value": 45.0,
        "unit": "dBA",
        "applicability_note": "Contextual nighttime sleep disturbance limit. NOT directly applicable to incident report counts."
    },
    "EPA_1974_OUTDOOR": {
        "standard": "US EPA Noise Levels Document (1974)",
        "limit_value": 55.0,
        "unit": "dBA",
        "applicability_note": "Contextual outdoor residential acoustic limit. NOT directly applicable to incident report counts."
    }
}

NOISE_SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Quiet Zone",
        "color": "#10B981",
        "health_impact": "Acoustic disturbance is minimal (0 recorded noise complaints in monitoring window)."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Low Disturbance",
        "color": "#06B6D4",
        "health_impact": "Low noise disturbance frequency (1–2 recorded complaints per day)."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Moderate Disturbance",
        "color": "#F59E0B",
        "health_impact": "Moderate noise disturbance frequency (3–5 recorded complaints per day)."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "Elevated Disturbance",
        "color": "#F97316",
        "health_impact": "Elevated acoustic noise disturbance requiring urban noise abatement."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "High Disturbance",
        "color": "#F43F5E",
        "health_impact": "High acoustic noise disturbance frequency (6–10 complaints per day)."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical Disturbance",
        "color": "#9333EA",
        "health_impact": "Critical acoustic noise disturbance zone (> 10 recorded noise complaints per day)."
    }
]

NOISE_METHODOLOGY_METADATA = {
    "name": "EcoTrend Acoustic Disturbance Index Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Acoustic Disturbance Index based on validated geocoded noise disturbance incident frequency.",
    "attribution_notice": "Score normalization curves represent EcoTrend's project-defined methodology (PROJECT_DEFINED_METHODOLOGY) and do not constitute official WHO or EPA decibel limits.",
    "last_updated": "2026-08-17"
}

def get_noise_category(score: float) -> Dict[str, Any]:
    score_int = int(round(max(0.0, min(100.0, score))))
    for cat in NOISE_SCORE_CATEGORIES:
        if cat["min_score"] <= score_int <= cat["max_score"]:
            return cat
    return NOISE_SCORE_CATEGORIES[-1]
