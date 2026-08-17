from typing import Dict, Any, List

WATER_METHODOLOGY_METADATA = {
    "name": "EcoTrend Water Quality Health Scoring Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Water Quality Health Score methodology for freshwater parameters, anchored in official WHO Guidelines for Drinking-Water Quality (4th ed.), US EPA Secondary Drinking Water Standards, and USGS Ecological Thresholds.",
    "attribution_notice": "Official reference thresholds are sourced from WHO Drinking-Water Guidelines, US EPA Primary/Secondary Standards, and USGS Ecological Limits. The 0–100 normalization curves, metric weighting scheme, and aggregate Water Quality Score formulas represent EcoTrend's project-defined scoring methodology and are not an official single-number index published by WHO or EPA.",
    "last_updated": "2026-08-17"
}

WATER_QUALITY_STANDARDS: Dict[str, Dict[str, Any]] = {
    "DO": {
        "metric": "DO",
        "title": "Dissolved Oxygen",
        "unit": "mg/L",
        "optimal_min": 6.5,
        "moderate_min": 5.0,
        "critical_min": 2.0,
        "standard_reference": "USGS / WHO_Freshwater_2021",
        "weight": 0.25,
        "weight_rationale": "Highest weight (25%) assigned because dissolved oxygen is critical for supporting aquatic life and preventing hypoxic microbial degradation."
    },
    "BOD": {
        "metric": "BOD",
        "title": "Biochemical Oxygen Demand",
        "unit": "mg/L",
        "optimal_max": 2.0,
        "moderate_max": 5.0,
        "critical_max": 30.0,
        "standard_reference": "WHO_Drinking_Water_4th_Ed / EPA_Surface_Water",
        "weight": 0.20,
        "weight_rationale": "Weight (20%) reflects organic waste pollution and bacterial oxygen consumption during aerobic decomposition."
    },
    "TDS": {
        "metric": "TDS",
        "title": "Total Dissolved Solids",
        "unit": "mg/L",
        "optimal_max": 300.0,
        "moderate_max": 500.0,
        "critical_max": 2000.0,
        "standard_reference": "WHO_Drinking_Water_4th_Ed / EPA_Secondary_2024",
        "weight": 0.15,
        "weight_rationale": "Weight (15%) accounts for total dissolved inorganic minerals, salinity, and drinking palatability thresholds."
    },
    "pH": {
        "metric": "pH",
        "title": "pH (Acidity/Alkalinity)",
        "unit": "dimensionless",
        "optimal_min": 6.5,
        "optimal_max": 8.5,
        "moderate_min": 6.0,
        "moderate_max": 9.0,
        "critical_min": 4.0,
        "critical_max": 10.5,
        "standard_reference": "WHO_Drinking_Water_4th_Ed / EPA_Secondary_2024",
        "weight": 0.15,
        "weight_rationale": "Weight (15%) reflects chemical balance; extreme pH alters heavy metal solubility and causes mucosal corrosion."
    },
    "COD": {
        "metric": "COD",
        "title": "Chemical Oxygen Demand",
        "unit": "mg/L",
        "optimal_max": 10.0,
        "moderate_max": 20.0,
        "critical_max": 100.0,
        "standard_reference": "WHO_Industrial_Effluent_Guidelines",
        "weight": 0.10,
        "weight_rationale": "Weight (10%) measures total oxidizable chemical pollutants, including non-biodegradable industrial effluents."
    },
    "Turbidity": {
        "metric": "Turbidity",
        "title": "Turbidity",
        "unit": "NTU",
        "optimal_max": 1.0,
        "moderate_max": 5.0,
        "critical_max": 50.0,
        "standard_reference": "WHO_Drinking_Water_4th_Ed / EPA_Primary_2024",
        "weight": 0.05,
        "weight_rationale": "Weight (5%) measures water clarity; high turbidity shelters pathogenic microbes from disinfection."
    },
    "Conductivity": {
        "metric": "Conductivity",
        "title": "Electrical Conductivity",
        "unit": "µS/cm",
        "optimal_max": 500.0,
        "moderate_max": 1000.0,
        "critical_max": 3000.0,
        "standard_reference": "WHO_Freshwater_2021",
        "weight": 0.05,
        "weight_rationale": "Weight (5%) measures ionic concentration and dissolved mineral salts."
    },
    "Temp": {
        "metric": "Temp",
        "title": "Water Temperature",
        "unit": "°C",
        "optimal_min": 10.0,
        "optimal_max": 22.0,
        "moderate_max": 25.0,
        "critical_max": 35.0,
        "standard_reference": "USGS_Ecological_Limits",
        "weight": 0.05,
        "weight_rationale": "Weight (5%) measures thermal pollution influencing dissolved oxygen saturation."
    }
}

WATER_SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Pristine",
        "color": "#10B981", # Emerald
        "health_impact": "Water quality meets strict WHO drinking water safety targets with optimal ecological conditions."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Good",
        "color": "#06B6D4", # Cyan
        "health_impact": "Water quality is satisfactory. Parameters meet standard safety limits with low pollution risk."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Moderate",
        "color": "#F59E0B", # Amber
        "health_impact": "Water quality is acceptable; minor organic or dissolved mineral loading observed."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "Poor",
        "color": "#F97316", # Orange
        "health_impact": "Pollution exceeds recommended safety guidelines. Requires filtration before domestic use."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "Very Poor",
        "color": "#F43F5E", # Rose
        "health_impact": "Severe organic or chemical contamination. High oxygen depletion or elevated dissolved solids."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical",
        "color": "#9333EA", # Purple
        "health_impact": "Hazardous toxic contamination or acute hypoxia requiring immediate environmental intervention."
    }
]

def get_water_category(score: float) -> Dict[str, Any]:
    score_clamped = max(0.0, min(100.0, score))
    for cat in WATER_SCORE_CATEGORIES:
        if cat["min_score"] <= score_clamped <= cat["max_score"]:
            return cat
    return WATER_SCORE_CATEGORIES[-1]
