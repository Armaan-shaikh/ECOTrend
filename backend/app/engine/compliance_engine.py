from typing import List, Dict, Any, Optional
from app.core.compliance_rules import COMPLIANCE_RULES

class ComplianceEvaluationEngine:
    """
    Standards & Guidelines Evaluation & Risk Engine:
    - Evaluates observations against rules (OBSERVED -> THRESHOLD -> STATUS -> SEVERITY).
    - Dynamic severity classification (CRITICAL, WARNING, ADVISORY, NORMAL).
    - EcoTrend Compounding Environmental Risk Index (0-100) tagged PROJECT_DEFINED_METHODOLOGY.
    """

    @staticmethod
    def evaluate_observation(rule_id: str, observed_value: float, location_id: str = "loc_us_ny_nyc_manhattan", timestamp: str = "2026-08-17T00:00:00Z") -> Dict[str, Any]:
        rule = COMPLIANCE_RULES.get(rule_id)
        if not rule or observed_value is None:
            return {
                "rule_id": rule_id,
                "domain": rule.get("domain", "unknown") if rule else "unknown",
                "metric": rule.get("metric", rule_id) if rule else rule_id,
                "observed_value": observed_value,
                "threshold": rule.get("threshold") if rule else None,
                "is_exceeded": False,
                "status": "UNEVALUATED",
                "evaluation_severity": "NORMAL",
                "explanation": "Observation or rule unavailable for compliance evaluation."
            }

        thresh = float(rule["threshold"])
        direction = rule["threshold_direction"]
        ref_type = rule["reference_type"]
        ref_name = rule["reference_name"]

        is_exceeded = False
        if direction == "ABOVE" and observed_value > thresh:
            is_exceeded = True
        elif direction == "BELOW" and observed_value < thresh:
            is_exceeded = True

        if not is_exceeded:
            status = "COMPLIANT"
            severity = "NORMAL"
            explanation = f"Observed {rule['metric']} ({observed_value} {rule['unit']}) is within {ref_name} threshold ({thresh} {rule['unit']})."
        else:
            status = f"EXCEEDED_{ref_type}"
            # Compute dynamic evaluation severity
            ratio = abs(observed_value - thresh) / max(thresh, 1.0)
            if ratio >= 0.5 or rule["default_warning_level"] == "CRITICAL":
                severity = "CRITICAL"
            elif ratio >= 0.2:
                severity = "WARNING"
            else:
                severity = "ADVISORY"

            explanation = (
                f"Observed {rule['averaging_period']} {rule['metric']} ({observed_value} {rule['unit']}) "
                f"exceeds {ref_name} threshold ({thresh} {rule['unit']}). Evaluated Severity: {severity}."
            )

        return {
            "rule_id": rule_id,
            "domain": rule["domain"],
            "metric": rule["metric"],
            "unit": rule["unit"],
            "averaging_period": rule["averaging_period"],
            "observed_value": round(observed_value, 2),
            "threshold": thresh,
            "threshold_direction": direction,
            "is_exceeded": is_exceeded,
            "status": status,
            "evaluation_severity": severity,
            "reference_name": ref_name,
            "reference_type": ref_type,
            "jurisdiction": rule["jurisdiction"],
            "source_url": rule["source_url"],
            "provenance": rule["provenance"],
            "explanation": explanation
        }

    @staticmethod
    def calculate_compounding_risk_index(evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate EcoTrend Compounding Environmental Risk Index (0-100).
        Explicitly tagged as PROJECT_DEFINED_METHODOLOGY.
        """
        exceeded_count = 0
        critical_count = 0
        warning_count = 0
        total_rules = len(evaluations)

        for ev in evaluations:
            if ev.get("is_exceeded"):
                exceeded_count += 1
                if ev.get("evaluation_severity") == "CRITICAL":
                    critical_count += 1
                elif ev.get("evaluation_severity") == "WARNING":
                    warning_count += 1

        # Compounding Risk Index Formula: Base risk + compounding multiplier
        base_risk = (exceeded_count / max(total_rules, 1)) * 50.0
        compounding_bonus = (critical_count * 20.0) + (warning_count * 10.0)
        risk_score = int(round(min(100.0, base_risk + compounding_bonus)))

        if risk_score >= 75:
            tier = "CRITICAL_HAZARD"
            color = "#F43F5E"
            action = "Immediate multi-domain environmental risk mitigation and EHS audit mandated."
        elif risk_score >= 50:
            tier = "ELEVATED_RISK"
            color = "#F97316"
            action = "Enhanced environmental surveillance and targeted pollution control recommended."
        elif risk_score >= 25:
            tier = "MODERATE_RISK"
            color = "#F59E0B"
            action = "Routine environmental monitoring; advisory alerts active."
        else:
            tier = "LOW_RISK"
            color = "#10B981"
            action = "Baseline compliant environmental conditions."

        return {
            "compounding_risk_score": risk_score,
            "risk_tier": tier,
            "color": color,
            "recommended_action": action,
            "total_evaluated_rules": total_rules,
            "exceeded_rules_count": exceeded_count,
            "critical_rules_count": critical_count,
            "warning_rules_count": warning_count,
            "methodology_reference": "PROJECT_DEFINED_METHODOLOGY",
            "attribution_notice": "EcoTrend Compounding Environmental Risk Index is a project-defined methodology classification.",
            "explanation": (
                f"EcoTrend Compounding Risk Index: {risk_score}/100 ({tier}). "
                f"{exceeded_count}/{total_rules} standards exceeded ({critical_count} critical, {warning_count} warning)."
            )
        }
