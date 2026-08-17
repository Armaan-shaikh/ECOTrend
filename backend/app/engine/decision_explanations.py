from typing import Dict, Any, List

class DecisionExplanationsEngine:
    """
    Transparent Decision Audit & Explanation Generator.
    Formats explicit 5-step decision provenance chains:
    [OBSERVATIONS] -> [FORECASTS] -> [COMPLIANCE/RISK] -> [PRIORITIZATION] -> [RECOMMENDATIONS]
    """

    @staticmethod
    def format_decision_audit(
        recommendation: Dict[str, Any],
        interventions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        ev = recommendation.get("evidence_chain", {})

        return {
            "recommendation_id": recommendation.get("id"),
            "location_id": recommendation.get("location_id"),
            "domain": recommendation.get("domain"),
            "title": recommendation.get("title"),
            "priority_tier": recommendation.get("priority_tier"),
            "priority_score": recommendation.get("priority_score"),
            "decision_chain": [
                {
                    "step": 1,
                    "phase": "OBSERVATION",
                    "provenance": "MEASURED",
                    "detail": f"Observed signal: {ev.get('observed_signal', {}).get('value', 'N/A')} {ev.get('observed_signal', {}).get('unit', '')}"
                },
                {
                    "step": 2,
                    "phase": "FORECAST_PROJECTION",
                    "provenance": "FORECAST",
                    "detail": f"Projected value: {ev.get('forecast_signal', {}).get('projected_value', 'N/A')} on {ev.get('forecast_signal', {}).get('timestamp', 'N/A')}"
                },
                {
                    "step": 3,
                    "phase": "COMPLIANCE_EVALUATION",
                    "provenance": "COMPLIANCE",
                    "detail": f"Reference: {ev.get('compliance_rule', {}).get('reference', 'EHS Guideline')} (Threshold: {ev.get('compliance_rule', {}).get('threshold', 'N/A')})"
                },
                {
                    "step": 4,
                    "phase": "ADAPTIVE_PRIORITIZATION",
                    "provenance": "DERIVED",
                    "detail": f"Calculated Priority Score: {recommendation.get('priority_score')} ({recommendation.get('priority_tier')} Tier)"
                },
                {
                    "step": 5,
                    "phase": "RECOMMENDATION_GENERATION",
                    "provenance": "DECISION_SUPPORT",
                    "detail": recommendation.get("rationale")
                }
            ],
            "actionable_interventions": interventions,
            "legal_disclaimer": "Decision Support recommendations provide automated intelligence to assist human EHS managers and do not substitute for official statutory compliance orders."
        }
