from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.compliance_rules import COMPLIANCE_RULES
from app.engine.observability_engine import ObservabilityEngine

class PredictiveRiskEngine:
    """
    Predictive Environmental Risk & Early Warning Alert Engine.
    - Evaluates forecasted values against Phase 9 standards repository.
    - Strictly distinguishes OBSERVED_COMPLIANCE_EVENT vs FORECASTED_COMPLIANCE_RISK.
    - Triggers early-warning predictive alerts via Phase 11 Observability Engine with 30min cooldown.
    - Produces transparent explainability text.
    """

    @staticmethod
    def evaluate_forecasted_risks(
        forecast_result: Dict[str, Any],
        trigger_alerts: bool = True
    ) -> List[Dict[str, Any]]:
        domain = forecast_result.get("domain", "air")
        metric = forecast_result.get("metric", "PM2.5")
        projections = forecast_result.get("projections", [])

        if not projections or forecast_result.get("status") != "VALID_FORECAST":
            return []

        # Find rules matching domain and metric
        metric_rules = [r for r in COMPLIANCE_RULES.values() if r["domain"].lower() == domain.lower() and r["metric"].upper() == metric.upper()]

        forecasted_risks = []

        for p in projections:
            val = p["forecast_value"]
            ts = p["timestamp"]

            for r in metric_rules:
                threshold = float(r["threshold"])
                direction = r["threshold_direction"].upper()
                is_exceeded = False

                if direction in ["MAX", "ABOVE"] and val > threshold:
                    is_exceeded = True
                elif direction in ["MIN", "BELOW"] and val < threshold:
                    is_exceeded = True

                if is_exceeded:
                    severity = "CRITICAL" if (direction in ["MAX", "ABOVE"] and val > threshold * 1.5) or (direction in ["MIN", "BELOW"] and val < threshold * 0.5) else "WARNING"
                    
                    risk_event = {
                        "domain": domain,
                        "metric": metric,
                        "forecast_value": val,
                        "forecast_timestamp": ts,
                        "threshold": threshold,
                        "threshold_direction": direction,
                        "unit": r["unit"],
                        "severity": severity,
                        "reference_name": r["reference_name"],
                        "reference_type": r["reference_type"],
                        "jurisdiction": r["jurisdiction"],
                        "event_type": "FORECASTED_COMPLIANCE_RISK",
                        "provenance": "FORECAST",
                        "explanation": f"Forecasted {metric} value of {val} {r['unit']} on {ts} projected to breach {r['reference_name']} threshold of {threshold} {r['unit']}. Note: Forecast projections are for decision support and do not represent confirmed regulatory violations."
                    }
                    forecasted_risks.append(risk_event)

                    # Trigger Early-Warning Alert if requested
                    if trigger_alerts:
                        ObservabilityEngine.create_operational_alert(
                            source=r["reference_name"],
                            domain=domain,
                            severity=severity,
                            condition=f"FORECASTED_THRESHOLD_EXCEEDANCE_{metric.upper()}",
                            observed_value=f"Projected {val} {r['unit']}",
                            expected_condition=f"<= {threshold} {r['unit']}",
                            provenance_context=risk_event["explanation"],
                            cooldown_minutes=30
                        )

        return forecasted_risks
