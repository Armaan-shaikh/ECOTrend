from typing import Dict, Any, List
from app.engine.explanations.templates import SCENARIO_DEFINITIONS

class ForecastExplainer:
    """
    Forecast & Scenario Explainer:
    Converts Phase 2A scenario forecasts into non-certainty plain-language projection explanations.
    """

    @staticmethod
    def explain_forecast_outlook(forecast_data: Dict[str, Any]) -> str:
        if not forecast_data or not forecast_data.get("projections"):
            return "No forecast projection data available for the selected horizon."

        metric = forecast_data.get("metric", "PM2.5")
        unit = forecast_data.get("unit", "µg/m³")
        horizon = forecast_data.get("horizon", "1_YEAR").replace("_", " ").lower()
        model_name = forecast_data.get("champion_model", "Selected Model")
        projections = forecast_data["projections"]
        
        last_proj = projections[-1]
        base_val = last_proj.get("baseline_value", 0.0)
        ci_lower = last_proj.get("ci_95_lower", 0.0)
        ci_upper = last_proj.get("ci_95_upper", 0.0)

        first_base = projections[0].get("baseline_value", base_val)
        if base_val > first_base * 1.05:
            direction_desc = "projected to gradually increase"
        elif base_val < first_base * 0.95:
            direction_desc = "projected to gradually decrease"
        else:
            direction_desc = "projected to remain relatively stable"

        text = (
            f"Under the baseline scenario using the {model_name}, {metric} is {direction_desc} "
            f"toward approximately {base_val:.1f} {unit} over the selected {horizon} horizon. "
            f"The estimated 95% confidence uncertainty range spans from {ci_lower:.1f} to {ci_upper:.1f} {unit}."
        )
        return text

    @staticmethod
    def explain_scenarios() -> Dict[str, Dict[str, str]]:
        return SCENARIO_DEFINITIONS
