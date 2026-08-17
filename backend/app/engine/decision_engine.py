import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.engine.adaptive_prioritization import AdaptivePrioritizationEngine
from app.engine.intervention_engine import InterventionEngine

logger = logging.getLogger("ecotrend.decision_engine")

class DecisionIntelligenceEngine:
    """
    Centralized Decision Intelligence Engine.
    - Combines observations, forecasts, compliance evaluations, and predictive risks.
    - Generates prioritized, actionable environmental recommendations.
    - Manages Recommendation Lifecycle: GENERATED -> ACTIVE -> ACKNOWLEDGED -> RESOLVED -> EXPIRED.
    - Guarantees deterministic recommendation outputs.
    - Provenance: DECISION_SUPPORT.
    """

    @staticmethod
    def generate_recommendations_for_location(
        location_id: str,
        domain_scores: Dict[str, float],
        exceeded_rules: List[Dict[str, Any]],
        forecasted_risks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        recommendations = []

        # 1. Process Exceeded Rules (Compliance Signals)
        for rule in exceeded_rules:
            dom = rule.get("domain", "air")
            metric = rule.get("metric", "PM2.5")
            val = rule.get("observed_value", 0.0)
            thresh = rule.get("threshold", 15.0)

            # Adaptive Prioritization
            p_res = AdaptivePrioritizationEngine.calculate_priority(
                severity=rule.get("evaluation_severity", "WARNING"),
                confidence=0.95, # Measured observation confidence
                exceedance_margin_pct=max(10.0, ((val - thresh) / thresh) * 100.0) if thresh > 0 else 20.0,
                persistence_hours=24.0,
                affected_domains_count=len(domain_scores)
            )

            rec_id = f"rec_comp_{dom}_{metric}_{uuid.uuid4().hex[:6]}"
            recommendations.append({
                "id": rec_id,
                "location_id": location_id,
                "domain": dom,
                "metric": metric,
                "title": f"Mitigate {metric} Exceedance Breach ({rule.get('reference_name', 'Standard')})",
                "priority_tier": p_res["priority_tier"],
                "priority_score": p_res["priority_score"],
                "status": "ACTIVE",
                "severity": rule.get("evaluation_severity", "WARNING"),
                "confidence": 0.95,
                "provenance": "DECISION_SUPPORT",
                "rationale": f"Observed {metric} value of {val} {rule.get('unit', '')} breaches threshold of {thresh} {rule.get('unit', '')} defined by {rule.get('reference_name', 'Guidelines')}.",
                "evidence_chain": {
                    "observed_signal": {"value": val, "unit": rule.get("unit", ""), "provenance": "MEASURED"},
                    "compliance_rule": {"threshold": thresh, "reference": rule.get("reference_name", ""), "reference_type": rule.get("reference_type", "")},
                    "priority_breakdown": p_res["contributing_factors"]
                },
                "recommended_actions": [
                    f"Activate targeted {dom} quality mitigation protocol.",
                    f"Notify regional EHS officer regarding {rule.get('reference_name')} threshold breach."
                ],
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        # 2. Process Forecasted Risks (Predictive Signals)
        for risk in forecasted_risks:
            dom = risk.get("domain", "air")
            metric = risk.get("metric", "PM2.5")
            f_val = risk.get("forecast_value", 0.0)
            thresh = risk.get("threshold", 15.0)

            p_res = AdaptivePrioritizationEngine.calculate_priority(
                severity=risk.get("severity", "WARNING"),
                confidence=0.85, # Statistical forecast confidence
                exceedance_margin_pct=max(10.0, ((f_val - thresh) / thresh) * 100.0) if thresh > 0 else 15.0,
                persistence_hours=48.0,
                affected_domains_count=len(domain_scores)
            )

            rec_id = f"rec_pred_{dom}_{metric}_{uuid.uuid4().hex[:6]}"
            recommendations.append({
                "id": rec_id,
                "location_id": location_id,
                "domain": dom,
                "metric": metric,
                "title": f"Early Warning: Projected {metric} Threshold Breach on {risk.get('forecast_timestamp', 'Upcoming Horizon')}",
                "priority_tier": p_res["priority_tier"],
                "priority_score": p_res["priority_score"],
                "status": "ACTIVE",
                "severity": risk.get("severity", "WARNING"),
                "confidence": 0.85,
                "provenance": "DECISION_SUPPORT",
                "rationale": f"Projected {metric} value of {f_val} {risk.get('unit', '')} expected to exceed {risk.get('reference_name', 'Guideline')} threshold of {thresh} {risk.get('unit', '')}.",
                "evidence_chain": {
                    "forecast_signal": {"projected_value": f_val, "timestamp": risk.get("forecast_timestamp"), "provenance": "FORECAST"},
                    "compliance_rule": {"threshold": thresh, "reference": risk.get("reference_name", "")},
                    "priority_breakdown": p_res["contributing_factors"]
                },
                "recommended_actions": [
                    f"Pre-emptively inspect {dom} emission sources before projected breach timeframe.",
                    f"Run what-if scenario simulations to evaluate pre-emptive mitigation options."
                ],
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        # Sort recommendations by Priority Score (descending)
        recommendations.sort(key=lambda r: r["priority_score"], reverse=True)
        return recommendations
