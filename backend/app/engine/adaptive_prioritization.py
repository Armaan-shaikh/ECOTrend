from typing import Dict, Any

class AdaptivePrioritizationEngine:
    """
    Deterministic Adaptive Prioritization Scoring Engine.
    - Calculates a 0-100 Priority Score using explicit factor weights.
    - Assigns Priority Tier: CRITICAL (>=80), HIGH (65-79), MEDIUM (45-64), LOW (<45).
    - Exposes contributing factor weights and uncertainty indicator.
    - No black-box opaque ML or fabricated weights.
    """

    WEIGHTS = {
        "severity": 0.30,
        "confidence": 0.20,
        "compliance_margin": 0.25,
        "duration_persistence": 0.15,
        "domain_breadth": 0.10
    }

    SEVERITY_SCORES = {
        "CRITICAL": 100.0,
        "WARNING": 70.0,
        "ADVISORY": 40.0,
        "NORMAL": 10.0
    }

    @staticmethod
    def calculate_priority(
        severity: str,
        confidence: float,
        exceedance_margin_pct: float,
        persistence_hours: float,
        affected_domains_count: int
    ) -> Dict[str, Any]:
        # 1. Component Factor Scores (0-100)
        s_sev = AdaptivePrioritizationEngine.SEVERITY_SCORES.get(severity.upper(), 40.0)
        s_conf = max(0.0, min(100.0, confidence * 100.0 if confidence <= 1.0 else confidence))
        s_comp = max(0.0, min(100.0, exceedance_margin_pct))
        s_dur = max(0.0, min(100.0, (persistence_hours / 72.0) * 100.0))
        s_dom = max(0.0, min(100.0, (affected_domains_count / 6.0) * 100.0))

        # 2. Weighted Priority Score
        w = AdaptivePrioritizationEngine.WEIGHTS
        score = (
            w["severity"] * s_sev +
            w["confidence"] * s_conf +
            w["compliance_margin"] * s_comp +
            w["duration_persistence"] * s_dur +
            w["domain_breadth"] * s_dom
        )
        priority_score = round(max(0.0, min(100.0, score)), 1)

        # 3. Assign Tier
        if priority_score >= 80.0:
            tier = "CRITICAL"
        elif priority_score >= 65.0:
            tier = "HIGH"
        elif priority_score >= 45.0:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # 4. Uncertainty Indicator
        uncertainty_pct = round(max(0.0, (1.0 - (s_conf / 100.0)) * 100.0), 1)

        return {
            "priority_score": priority_score,
            "priority_tier": tier,
            "uncertainty_pct": uncertainty_pct,
            "contributing_factors": {
                "severity_contribution": round(w["severity"] * s_sev, 1),
                "confidence_contribution": round(w["confidence"] * s_conf, 1),
                "compliance_margin_contribution": round(w["compliance_margin"] * s_comp, 1),
                "persistence_contribution": round(w["duration_persistence"] * s_dur, 1),
                "domain_breadth_contribution": round(w["domain_breadth"] * s_dom, 1)
            },
            "factor_scores": {
                "severity": s_sev,
                "confidence": s_conf,
                "compliance_margin": s_comp,
                "persistence_hours": persistence_hours,
                "affected_domains_count": affected_domains_count
            }
        }
