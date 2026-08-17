from typing import Dict, Any, List

# Explicit Reference Categories
REFERENCE_TYPES = {
    "TOXICOLOGICAL_SCREENING": "US EPA Ecological Soil Screening Levels (Eco-SSL 2005/2007) conservative screening thresholds for ecological receptors.",
    "REGULATORY_LIMIT": "EU Sewage Sludge Directive (86/278/EEC) & US EPA Part 503 legal limits for agricultural land.",
    "AGRONOMIC_GUIDELINE": "FAO-ISRIC World Soil Guidelines for crop productivity, soil organic matter, and salinization.",
    "PROJECT_DEFINED_METHODOLOGY": "EcoTrend project-defined 0–100 sub-score normalization methodology."
}

# Soil Quality Standards Reference Config
SOIL_QUALITY_STANDARDS: Dict[str, Dict[str, Any]] = {
    "SOC": {
        "metric": "SOC",
        "title": "Soil Organic Carbon",
        "unit": "%",
        "standard_reference": "FAO-ISRIC Soil Quality Guidelines",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.15,
        "optimal_min": 2.0,
        "moderate_min": 1.0,
        "critical_min": 0.2,
        "weight_rationale": "Weight (15%) assigned due to fundamental role in soil organic matter, nutrient retention, biological fertility, and carbon storage."
    },
    "pH": {
        "metric": "pH",
        "title": "Soil pH (Acidity / Alkalinity)",
        "unit": "dimensionless",
        "standard_reference": "FAO-ISRIC / USDA Soil Quality Guidelines",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.15,
        "optimal_min": 6.0,
        "optimal_max": 7.8,
        "moderate_min": 5.5,
        "moderate_max": 8.2,
        "weight_rationale": "Weight (15%) assigned as pH controls macro/micronutrient bio-availability and heavy metal solubility."
    },
    "Pb": {
        "metric": "Pb",
        "title": "Lead (Pb)",
        "unit": "mg/kg",
        "standard_reference": "US EPA Eco-SSL (OSWER Directive 9285.7-55)",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.15,
        "optimal_max": 50.0,
        "moderate_max": 200.0,
        "critical_max": 800.0,
        "weight_rationale": "Weight (15%) assigned due to neurotoxic bio-accumulative risks to soil fauna, wildlife, and human food safety."
    },
    "Cd": {
        "metric": "Cd",
        "title": "Cadmium (Cd)",
        "unit": "mg/kg",
        "standard_reference": "US EPA Eco-SSL / EU Directive 86/278/EEC",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.10,
        "optimal_max": 1.0,
        "moderate_max": 3.0,
        "critical_max": 20.0,
        "weight_rationale": "Weight (10%) assigned due to high plant root bio-uptake toxicity and renal risk."
    },
    "As": {
        "metric": "As",
        "title": "Arsenic (As)",
        "unit": "mg/kg",
        "standard_reference": "US EPA Eco-SSL (Plant & Wildlife)",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.10,
        "optimal_max": 18.0,
        "moderate_max": 40.0,
        "critical_max": 200.0,
        "weight_rationale": "Weight (10%) assigned due to carcinogenic metalloid risk from industrial emissions and agrochemicals."
    },
    "Hg": {
        "metric": "Hg",
        "title": "Mercury (Hg)",
        "unit": "mg/kg",
        "standard_reference": "US EPA Eco-SSL / EU Sewage Sludge Limit",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.10,
        "optimal_max": 0.1,
        "moderate_max": 1.5,
        "critical_max": 10.0,
        "weight_rationale": "Weight (10%) assigned due to extreme terrestrial food-web bio-magnification."
    },
    "Cr": {
        "metric": "Cr",
        "title": "Chromium (Total Cr)",
        "unit": "mg/kg",
        "standard_reference": "US EPA Eco-SSL / EU Directive 86/278/EEC",
        "reference_type": "TOXICOLOGICAL_SCREENING",
        "weight": 0.10,
        "optimal_max": 26.0,
        "moderate_max": 100.0,
        "critical_max": 1000.0,
        "weight_rationale": "Weight (10%) assigned as a key industrial effluent and tannery waste contaminant."
    },
    "TPH": {
        "metric": "TPH",
        "title": "Total Petroleum Hydrocarbons",
        "unit": "mg/kg",
        "standard_reference": "US EPA / State UST Cleanup Screening Levels",
        "reference_type": "REGULATORY_LIMIT",
        "weight": 0.05,
        "optimal_max": 50.0,
        "moderate_max": 200.0,
        "critical_max": 2000.0,
        "weight_rationale": "Weight (5%) assigned for fuel/oil spill contamination causing soil anaerobiosis."
    },
    "EC": {
        "metric": "EC",
        "title": "Soil Electrical Conductivity",
        "unit": "dS/m",
        "standard_reference": "FAO-ISRIC Salinization Guidelines",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.05,
        "optimal_max": 2.0,
        "moderate_max": 4.0,
        "critical_max": 12.0,
        "weight_rationale": "Weight (5%) assigned as an indicator of soil salinization and osmotic stress."
    },
    "Moisture": {
        "metric": "Moisture",
        "title": "Soil Moisture Content",
        "unit": "%",
        "standard_reference": "FAO-ISRIC Hydrological Guidelines",
        "reference_type": "AGRONOMIC_GUIDELINE",
        "weight": 0.05,
        "optimal_min": 15.0,
        "optimal_max": 35.0,
        "moderate_min": 10.0,
        "moderate_max": 45.0,
        "weight_rationale": "Weight (5%) assigned for plant available water capacity and aerobic microbial respiration."
    }
}

SOIL_SCORE_CATEGORIES = [
    {
        "min_score": 90,
        "max_score": 100,
        "category": "Pristine",
        "color": "#10B981",
        "health_impact": "Soil is rich in organic matter, optimal pH, and free from heavy metal or hydrocarbon contamination."
    },
    {
        "min_score": 75,
        "max_score": 89,
        "category": "Good",
        "color": "#06B6D4",
        "health_impact": "Soil quality is satisfactory. Heavy metal levels meet strict EPA screening guidelines."
    },
    {
        "min_score": 60,
        "max_score": 74,
        "category": "Moderate",
        "color": "#F59E0B",
        "health_impact": "Soil condition shows moderate salinization or minor trace metal accumulation."
    },
    {
        "min_score": 45,
        "max_score": 59,
        "category": "Poor",
        "color": "#F97316",
        "health_impact": "Trace contaminants or severe organic matter depletion exceed ecological targets."
    },
    {
        "min_score": 25,
        "max_score": 44,
        "category": "Very Poor",
        "color": "#F43F5E",
        "health_impact": "Significant heavy metal toxicity or hydrocarbon spill requiring soil remediation."
    },
    {
        "min_score": 0,
        "max_score": 24,
        "category": "Critical",
        "color": "#9333EA",
        "health_impact": "Severe toxic industrial contamination posing acute ecological and groundwater risks."
    }
]

SOIL_METHODOLOGY_METADATA = {
    "name": "EcoTrend Soil Quality Health Scoring Methodology",
    "version": "1.0",
    "description": "Project-defined 0–100 Soil Quality Health Score methodology for soil parameters, anchored in official US EPA Ecological Soil Screening Levels (Eco-SSL), EU Sewage Sludge Directive (86/278/EEC), and FAO-ISRIC World Soil Guidelines.",
    "attribution_notice": "Official reference thresholds are sourced from US EPA Eco-SSL OSWER directives, EU Sludge Directives, and FAO Soil Guidelines. The 0–100 normalization curves and weighting scheme represent EcoTrend's project-defined scoring methodology and are not an official EPA/FAO index.",
    "last_updated": "2026-08-17"
}

def get_soil_category(score: float) -> Dict[str, Any]:
    score_int = int(round(max(0.0, min(100.0, score))))
    for cat in SOIL_SCORE_CATEGORIES:
        if cat["min_score"] <= score_int <= cat["max_score"]:
            return cat
    return SOIL_SCORE_CATEGORIES[-1]
