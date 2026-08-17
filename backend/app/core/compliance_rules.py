"""
EcoTrend Phase 9: Standards & Guidelines Compliance Repository.
Enforces explicit metadata attribution for all environmental rules:
- reference_type: GUIDELINE | POLICY_TARGET | BENCHMARK | PROJECT_DEFINED_METHODOLOGY
- averaging_period: 24_HOUR_MEAN | ANNUAL_MEAN | SAMPLE_OBSERVATION | DAILY_WINDOW
- source_url & jurisdiction
"""

COMPLIANCE_RULES = {
    "rule_air_pm25_24h": {
        "rule_id": "rule_air_pm25_24h",
        "domain": "air",
        "metric": "PM2.5",
        "unit": "ug/m3",
        "averaging_period": "24_HOUR_MEAN",
        "threshold": 15.0,
        "threshold_direction": "ABOVE",
        "reference_name": "WHO Air Quality Guidelines (2021)",
        "reference_type": "GUIDELINE",
        "jurisdiction": "Global / International",
        "source_url": "https://www.who.int/publications/i/item/9789240034228",
        "provenance": "MEASURED",
        "default_warning_level": "WARNING"
    },
    "rule_air_pm25_annual": {
        "rule_id": "rule_air_pm25_annual",
        "domain": "air",
        "metric": "PM2.5",
        "unit": "ug/m3",
        "averaging_period": "ANNUAL_MEAN",
        "threshold": 5.0,
        "threshold_direction": "ABOVE",
        "reference_name": "WHO Air Quality Guidelines (2021)",
        "reference_type": "GUIDELINE",
        "jurisdiction": "Global / International",
        "source_url": "https://www.who.int/publications/i/item/9789240034228",
        "provenance": "MEASURED",
        "default_warning_level": "ADVISORY"
    },
    "rule_water_do_hypoxia": {
        "rule_id": "rule_water_do_hypoxia",
        "domain": "water",
        "metric": "DO",
        "unit": "mg/L",
        "averaging_period": "DAILY_MEAN",
        "threshold": 4.0,
        "threshold_direction": "BELOW",
        "reference_name": "EcoTrend Ecological Hypoxia Criteria",
        "reference_type": "PROJECT_DEFINED_METHODOLOGY",
        "jurisdiction": "EcoTrend Project Standard",
        "source_url": "https://ecotrend.internal/methodology/water-hypoxia",
        "provenance": "MEASURED",
        "default_warning_level": "CRITICAL"
    },
    "rule_soil_pb_screening": {
        "rule_id": "rule_soil_pb_screening",
        "domain": "soil",
        "metric": "Pb",
        "unit": "mg/kg",
        "averaging_period": "SAMPLE_OBSERVATION",
        "threshold": 200.0,
        "threshold_direction": "ABOVE",
        "reference_name": "US EPA Ecological Soil Screening Level (Eco-SSL) Soil Invertebrates",
        "reference_type": "GUIDELINE",
        "jurisdiction": "United States",
        "source_url": "https://www.epa.gov/chemical-research/ecological-soil-screening-levels-eco-ssl",
        "provenance": "MODELED_ESTIMATE",
        "default_warning_level": "WARNING"
    },
    "rule_climate_warming_limit": {
        "rule_id": "rule_climate_warming_limit",
        "domain": "climate",
        "metric": "T_ANOMALY",
        "unit": "degC",
        "averaging_period": "ANNUAL_ANOMALY",
        "threshold": 1.5,
        "threshold_direction": "ABOVE",
        "reference_name": "IPCC AR6 Paris Agreement Climate Pathway Target",
        "reference_type": "POLICY_TARGET",
        "jurisdiction": "Global UNFCCC Paris Agreement",
        "source_url": "https://www.ipcc.ch/sr15/",
        "provenance": "REANALYSIS",
        "default_warning_level": "WARNING"
    },
    "rule_emissions_footprint": {
        "rule_id": "rule_emissions_footprint",
        "domain": "emissions",
        "metric": "CO2_PER_CAPITA",
        "unit": "t/capita",
        "averaging_period": "ANNUAL_PER_CAPITA",
        "threshold": 4.7,
        "threshold_direction": "ABOVE",
        "reference_name": "World Bank / OWID Global Per Capita Carbon Benchmark",
        "reference_type": "BENCHMARK",
        "jurisdiction": "Global Benchmark",
        "source_url": "https://data.worldbank.org/indicator/EN.ATM.CO2E.PC",
        "provenance": "ESTIMATED",
        "default_warning_level": "ADVISORY"
    },
    "rule_noise_incident_surge": {
        "rule_id": "rule_noise_incident_surge",
        "domain": "noise",
        "metric": "NOISE_INCIDENTS",
        "unit": "incidents/day",
        "averaging_period": "DAILY_WINDOW",
        "threshold": 10.0,
        "threshold_direction": "ABOVE",
        "reference_name": "EcoTrend Acoustic Disturbance Incident Surge Threshold",
        "reference_type": "PROJECT_DEFINED_METHODOLOGY",
        "jurisdiction": "EcoTrend Project Standard",
        "source_url": "https://ecotrend.internal/methodology/noise-surges",
        "provenance": "MEASURED",
        "default_warning_level": "WARNING"
    }
}
