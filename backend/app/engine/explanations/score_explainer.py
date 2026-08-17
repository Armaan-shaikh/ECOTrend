from typing import Dict, Any, Optional

class ScoreExplainer:
    """
    Score Explainer:
    Provides clear plain-language descriptions of EcoTrend's standards-aligned Air Quality Health Score (EHS).
    """

    @staticmethod
    def explain_score(ehs_data: Dict[str, Any]) -> str:
        if not ehs_data:
            return "Environmental Health Score calculation is unavailable."

        score = ehs_data.get("overall_ehs", 50)
        category = ehs_data.get("category", "Moderate")
        driver = ehs_data.get("primary_pollutant_driver", "None")
        coverage = ehs_data.get("data_coverage_percent", 100.0)

        intro = f"EcoTrend's standards-aligned Air Quality Health Score is {score}/100, classified as {category}."

        if driver and driver != "None":
            driver_text = f" The score is primarily affected by {driver} concentrations relative to WHO 2021 guidelines."
        else:
            driver_text = " All monitored air metrics remain within baseline safety limits."

        if coverage < 100.0:
            coverage_text = f" Data coverage is currently {coverage}%, so the score reflects available active metrics only."
        else:
            coverage_text = " Data coverage is 100% across all primary air quality parameters."

        return f"{intro}{driver_text}{coverage_text}"

    @staticmethod
    def get_attribution_note() -> str:
        return (
            "Attribution Notice: EcoTrend's 0–100 Environmental Health Score (EHS) is a project-defined scoring methodology "
            "anchored in official WHO 2021 Air Quality Guidelines and US EPA AQI breakpoints. It is not an official "
            "single-number index published by WHO or US EPA."
        )
