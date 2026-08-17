from typing import Dict, Any

METRIC_DEFINITIONS: Dict[str, Dict[str, str]] = {
    "PM2.5": {
        "metric": "PM2.5",
        "title": "Fine Particulate Matter (PM2.5)",
        "definition": "PM2.5 refers to extremely small airborne particles (less than 2.5 micrometers in diameter) that can travel deep into the lungs and enter the bloodstream.",
        "common_sources": "Vehicle exhaust, industrial emissions, power plants, and wood burning.",
        "health_relevance": "Fine particles pose severe respiratory and cardiovascular risks upon long-term exposure."
    },
    "PM10": {
        "metric": "PM10",
        "title": "Coarse Particulate Matter (PM10)",
        "definition": "PM10 refers to larger airborne particles (less than 10 micrometers in diameter) such as dust, pollen, mold, and crushed rock.",
        "common_sources": "Construction sites, unpaved roads, windblown dust, and agricultural activities.",
        "health_relevance": "Coarse particles irritate the upper respiratory tract, eyes, and lungs, worsening asthma."
    },
    "NO2": {
        "metric": "NO2",
        "title": "Nitrogen Dioxide (NO₂)",
        "definition": "NO₂ is a reddish-brown toxic gas with a sharp odor, formed during high-temperature fuel combustion.",
        "common_sources": "Motor vehicle emissions, power plants, and industrial boilers.",
        "health_relevance": "Nitrogen dioxide causes airway inflammation, increases asthma severity, and contributes to ground-level ozone formation."
    },
    "SO2": {
        "metric": "SO2",
        "title": "Sulfur Dioxide (SO₂)",
        "definition": "SO₂ is a pungent gas produced when sulfur-bearing fossil fuels are burned.",
        "common_sources": "Coal-fired power plants, metal smelters, oil refineries, and heavy diesel equipment.",
        "health_relevance": "Sulfur dioxide causes acute bronchoconstriction, throat irritation, and acid rain deposition."
    },
    "O3": {
        "metric": "O3",
        "title": "Ground-Level Ozone (O₃)",
        "definition": "Ground-level ozone is a reactive gas formed when nitrogen oxides and volatile organic compounds react in the presence of sunlight.",
        "common_sources": "Secondary pollutant formed from vehicle fumes, chemical solvents, and industrial emissions exposed to heat and sunlight.",
        "health_relevance": "Ozone irritates pulmonary tissue, reduces lung capacity, and causes chest pain during physical exertion."
    },
    "CO": {
        "metric": "CO",
        "title": "Carbon Monoxide (CO)",
        "definition": "Carbon monoxide is a colorless, odorless gas produced during incomplete carbon fuel combustion.",
        "common_sources": "Vehicle exhausts, faulty gas heaters, generators, and wood stoves.",
        "health_relevance": "Carbon monoxide reduces blood oxygen delivery to vital organs such as the heart and brain."
    },
    "AQI": {
        "metric": "AQI",
        "title": "Air Quality Index (AQI)",
        "definition": "AQI is a standardized composite index converting multiple air pollutant concentrations into a simplified daily scale.",
        "common_sources": "Composite calculation combining PM2.5, PM10, NO2, SO2, O3, and CO.",
        "health_relevance": "Provides a quick indicator of daily outdoor air safety for the general public."
    }
}

SCENARIO_DEFINITIONS = {
    "baseline": {
        "name": "Current Baseline Projection 🔵",
        "explanation": "Represents the statistical continuation of observed historical trends and seasonal cycles into the future.",
        "caveat": "Assumes historical emission patterns and weather variability continue without major policy shifts."
    },
    "improvement": {
        "name": "Policy Mitigation Scenario 🟢",
        "explanation": "Represents a modeled progressive mitigation scenario incorporating clean energy transitions and reduced emissions.",
        "caveat": "Modeled policy scenario for planning; should not be interpreted as a guaranteed outcome."
    },
    "worsening": {
        "name": "Urban Degradation Scenario 🔴",
        "explanation": "Represents a modeled degradation scenario incorporating accelerated urban growth, traffic density, or increased industrial emissions.",
        "caveat": "Modeled degradation scenario for risk assessment; not a prediction that deterioration will necessarily occur."
    }
}
