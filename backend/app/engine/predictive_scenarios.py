from typing import Dict, Any, List
from app.engine.multi_domain import MultiDomainEngine

class ScenarioDecisionEngine:
    """
    Transparent What-If Scenario Decision Support Engine.
    - Simulates controlled hypothetical changes to environmental domain metrics.
    - Computes projected domain score impacts and overall CEPI impacts.
    - Guarantees zero mutation of actual database measurements.
    - Explicit Provenance: SCENARIO.
    """

    @staticmethod
    def simulate_intervention_scenario(
        location_id: str,
        baseline_domain_scores: Dict[str, float],
        interventions: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Interventions payload format:
        {
          "air_score_change": +10.0,       # e.g. +10 pts for 20% PM2.5 reduction
          "water_score_change": +8.0,      # e.g. +8 pts for aeration intervention
          "soil_score_change": 0.0,
          "climate_score_change": +5.0,
          "emissions_score_change": +12.0, # e.g. +12 pts for clean energy transition
          "noise_score_change": +15.0      # e.g. +15 pts for acoustic barrier installation
        }
        """

        # Format baseline domain scores for MultiDomainEngine
        base_dict = {dom: {"score": val, "is_available": True} for dom, val in baseline_domain_scores.items()}

        # 1. Calculate Baseline CEPI
        baseline_cepi_res = MultiDomainEngine.calculate_cepi(base_dict)
        baseline_cepi = baseline_cepi_res["cepi_score"]

        # 2. Apply Interventions to produce Projected Scores
        projected_domain_scores = {}
        proj_dict = {}
        for dom, base_val in baseline_domain_scores.items():
            change_key = f"{dom}_score_change"
            delta = interventions.get(change_key, 0.0)
            projected_val = max(0.0, min(100.0, base_val + delta))
            projected_domain_scores[dom] = round(projected_val, 1)
            proj_dict[dom] = {"score": projected_val, "is_available": True}

        # 3. Calculate Projected CEPI
        projected_cepi_res = MultiDomainEngine.calculate_cepi(proj_dict)
        projected_cepi = projected_cepi_res["cepi_score"]
        cepi_delta = round(projected_cepi - baseline_cepi, 1)

        # 4. Impact Summary & Affected Compliance Indicators
        domain_impacts = []
        for dom, base_val in baseline_domain_scores.items():
            proj_val = projected_domain_scores[dom]
            diff = round(proj_val - base_val, 1)
            domain_impacts.append({
                "domain": dom,
                "baseline_score": base_val,
                "projected_score": proj_val,
                "delta": diff,
                "impact_category": "IMPROVED" if diff > 0 else ("DEGRADED" if diff < 0 else "UNCHANGED")
            })

        return {
            "location_id": location_id,
            "status": "SUCCESS",
            "provenance": "SCENARIO",
            "baseline_cepi_score": baseline_cepi,
            "projected_cepi_score": projected_cepi,
            "cepi_delta": cepi_delta,
            "overall_impact": "POSITIVE" if cepi_delta > 0 else ("NEGATIVE" if cepi_delta < 0 else "NEUTRAL"),
            "domain_impacts": domain_impacts,
            "applied_interventions": interventions,
            "assumptions": [
                "Scenario projections evaluate hypothetical policy/engineering interventions under linear response assumptions.",
                "Real-world environmental non-linear feedbacks may alter actual outcomes.",
                "Scenario results do not mutate or overwrite historical database measurements."
            ]
        }
