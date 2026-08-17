from typing import Dict, Any, List

class TrendExplainer:
    """
    Trend & Anomaly Explainer:
    Converts Phase 1 historical analytics into factual, non-exaggerated plain-language trend explanations.
    """

    @staticmethod
    def explain_trend(analytics_summary: Dict[str, Any]) -> str:
        if not analytics_summary:
            return "Insufficient historical data available to compute a trend explanation."

        metric = analytics_summary.get("metric", "PM2.5")
        unit = analytics_summary.get("unit", "µg/m³")
        trend = analytics_summary.get("linear_trend", {})
        direction = trend.get("direction", "STABLE")
        rate_of_change = analytics_summary.get("rate_of_change_percent", 0.0)
        r2 = trend.get("r_squared", 0.0)
        total_obs = analytics_summary.get("total_observations", 0)

        change_str = f"({rate_of_change:+.1f}% net change)" if rate_of_change != 0 else "(no net change)"

        # Weak statistical confidence check (R^2 < 0.25)
        is_weak_confidence = r2 < 0.25 or total_obs < 14

        if direction == "IMPROVING":
            base_text = f"{metric} has decreased over the analyzed historical window {change_str}, indicating an improving trend."
        elif direction == "DEGRADING":
            base_text = f"{metric} has increased over the analyzed historical window {change_str}, indicating that pollutant levels have been getting worse."
        else:
            base_text = f"{metric} has remained relatively stable over the analyzed historical window {change_str}."

        if is_weak_confidence:
            confidence_note = f" Note: The linear trend fit shows low statistical confidence (R² = {r2:.2f}), suggesting high day-to-day variance or random fluctuations."
        else:
            confidence_note = f" The linear trend shows strong statistical consistency (R² = {r2:.2f})."

        return f"{base_text}{confidence_note}"

    @staticmethod
    def explain_anomalies(anomalies: List[Dict[str, Any]], metric: str, unit: str) -> List[str]:
        if not anomalies:
            return []

        explanations = []
        for anom in anomalies[:3]: # Explain up to top 3 anomalies
            ts_str = anom.get("timestamp", "").split("T")[0]
            val = anom.get("value", 0.0)
            z = anom.get("z_score", 0.0)
            text = (
                f"An unusually high {metric} measurement of {val} {unit} was detected on {ts_str} "
                f"(deviating by {abs(z):.1f} standard deviations from rolling mean). "
                "Because anomalous readings can result from temporary localized events or sensor issues, "
                "this reading should be interpreted with caution."
            )
            explanations.append(text)
        return explanations
