from typing import Dict, Any, List
from app.engine.explanations.trend_explainer import TrendExplainer
from app.engine.explanations.forecast_explainer import ForecastExplainer
from app.engine.explanations.score_explainer import ScoreExplainer
from app.engine.explanations.metric_explainer import MetricExplainer
from app.engine.explanations.templates import SCENARIO_DEFINITIONS

class EnvironmentalInsightEngine:
    """
    100% Deterministic Environmental Insight & Explanation Engine (No LLM):
    Orchestrates historical analytics, EHS scores, forecast scenarios, and data quality logs
    into structured, human-readable environmental reports.
    """

    @staticmethod
    def generate_location_report(
        location_name: str,
        analytics: Dict[str, Any],
        forecast: Dict[str, Any],
        ehs_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        metric = analytics.get("metric", "PM2.5")
        unit = analytics.get("unit", "µg/m³")

        # 1. Current Condition & EHS Explanation
        current_condition = ScoreExplainer.explain_score(ehs_data)
        primary_driver_metric = ehs_data.get("primary_pollutant_driver", metric)

        # 2. Historical Trend Explanation
        historical_trend = TrendExplainer.explain_trend(analytics)

        # 3. Forecast Outlook Explanation
        forecast_outlook = ForecastExplainer.explain_forecast_outlook(forecast)

        # 4. Scenario Comparison Wording
        horizon_label = forecast.get("horizon", "1_YEAR").replace("_", " ").lower()
        scenario_comparison = (
            f"Over the selected {horizon_label} horizon, EcoTrend models three scenario trajectories: "
            "🔵 Current Baseline assumes continuation of historical patterns; "
            "🟢 Policy Improvement models clean energy mitigation (-22% emissions decay); "
            "🔴 Urban Degradation models industrial/urban growth (+28% emissions escalation)."
        )

        # 5. Data Quality Note
        coverage = ehs_data.get("data_coverage_percent", 100.0)
        invalid_obs = analytics.get("invalid_observations", 0)
        suspect_obs = analytics.get("suspect_observations", 0)
        
        data_quality_note = f"Data coverage is {coverage}%."
        if invalid_obs > 0 or suspect_obs > 0:
            data_quality_note += f" Outlier filtering flagged {invalid_obs} invalid sensor errors and {suspect_obs} suspect readings."

        # 6. Key Findings Prioritization (Deterministic)
        key_findings = []
        warnings = []

        # Finding 1: Primary Pollutant Driver
        if primary_driver_metric and primary_driver_metric != "None":
            key_findings.append(f"Primary Air Quality Concern: {primary_driver_metric} is the largest contributor reducing the health score.")

        # Finding 2: Trend Direction
        direction = analytics.get("linear_trend", {}).get("direction", "STABLE")
        rate_of_change = analytics.get("rate_of_change_percent", 0.0)
        if direction == "DEGRADING":
            key_findings.append(f"Worsening Historical Trend: {metric} has increased by {abs(rate_of_change):.1f}% over the analyzed window.")
            warnings.append(f"Pollution Escalation Warning: {metric} exhibits an increasing trend.")
        elif direction == "IMPROVING":
            key_findings.append(f"Improving Historical Trend: {metric} has decreased by {abs(rate_of_change):.1f}% over the analyzed window.")

        # Finding 3: Anomalies Warning
        anomalies = analytics.get("anomalies", [])
        anomaly_expls = TrendExplainer.explain_anomalies(anomalies, metric, unit)
        for a_exp in anomaly_expls:
            warnings.append(a_exp)

        # Finding 4: Coverage Warning
        if coverage < 80.0:
            warnings.append(f"Low Data Coverage Warning: Only {coverage}% of expected air metrics were available. Interpret aggregate EHS score accordingly.")

        # 7. Summary Paragraph
        score = ehs_data.get("overall_ehs", 50)
        category = ehs_data.get("category", "Moderate")
        summary = (
            f"Environmental Assessment for {location_name}: Air Quality Score is {score}/100 ({category}). "
            f"{historical_trend} {forecast_outlook}"
        )

        # 8. Metric Glossary
        metric_explanations = MetricExplainer.get_all_metric_definitions()

        return {
            "location_name": location_name,
            "summary": summary,
            "current_condition": current_condition,
            "historical_trend": historical_trend,
            "primary_driver": primary_driver_metric,
            "forecast_outlook": forecast_outlook,
            "scenario_comparison": scenario_comparison,
            "data_quality_note": data_quality_note,
            "metric_explanations": metric_explanations,
            "key_findings": key_findings,
            "warnings": warnings,
            "methodology_note": ScoreExplainer.get_attribution_note()
        }
