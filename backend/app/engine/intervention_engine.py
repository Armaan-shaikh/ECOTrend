from typing import Dict, Any, List
from app.engine.predictive_scenarios import ScenarioDecisionEngine

class InterventionEngine:
    """
    Actionable Intervention Recommendation Engine.
    - Generates engineering and policy intervention packages across environmental domains.
    - Reuses Phase 12 ScenarioDecisionEngine to compute projected CEPI & domain score improvements.
    - Guarantees zero database mutation.
    - Explicit Provenance: DECISION_SUPPORT.
    """

    RECOMMENDED_INTERVENTIONS = [
        {
            "id": "int_air_traffic",
            "name": "Urban Traffic Low-Emission Zone & Signal Optimization",
            "domain": "air",
            "target_metric": "PM2.5",
            "expected_score_improvement": 12.0,
            "interventions_payload": {"air_score_change": 12.0},
            "description": "Deploy low-emission vehicle corridors and adaptive traffic signals to mitigate particulate concentration.",
            "confidence": 0.88,
            "assumptions": ["Assumes 25% traffic volume reduction in central monitoring sector."]
        },
        {
            "id": "int_water_aeration",
            "name": "Estuary Diffused-Air Aeration & Wetland Buffer Installation",
            "domain": "water",
            "target_metric": "DO",
            "expected_score_improvement": 10.0,
            "interventions_payload": {"water_score_change": 10.0},
            "description": "Install mechanical micro-bubble aeration systems to elevate dissolved oxygen and eliminate hypoxia risk.",
            "confidence": 0.90,
            "assumptions": ["Assumes continuous power supply and baseline water temperature < 25°C."]
        },
        {
            "id": "int_soil_remediation",
            "name": "Floodplain Soil Bio-Char & Lead Phytoremediation",
            "domain": "soil",
            "target_metric": "Pb",
            "expected_score_improvement": 8.0,
            "interventions_payload": {"soil_score_change": 8.0},
            "description": "Apply organic bio-char matrix to bind heavy metal cations and prevent soil leaching.",
            "confidence": 0.85,
            "assumptions": ["Requires 60-day stabilization window."]
        },
        {
            "id": "int_noise_barriers",
            "name": "Commercial Transit Acoustic Absorption Barrier Network",
            "domain": "noise",
            "target_metric": "NOISE_INCIDENTS",
            "expected_score_improvement": 15.0,
            "interventions_payload": {"noise_score_change": 15.0},
            "description": "Erect micro-perforated acoustic dampening panels along high-decibel transit corridors.",
            "confidence": 0.92,
            "assumptions": ["Assumes 10 dBA decibel reduction at 50m receptor perimeter."]
        }
    ]

    @staticmethod
    def evaluate_interventions(
        location_id: str,
        baseline_domain_scores: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        evaluations = []

        for intv in InterventionEngine.RECOMMENDED_INTERVENTIONS:
            # Reuse Phase 12 Scenario Engine for impact projection
            sim_res = ScenarioDecisionEngine.simulate_intervention_scenario(
                location_id=location_id,
                baseline_domain_scores=baseline_domain_scores,
                interventions=intv["interventions_payload"]
            )

            evaluations.append({
                "id": intv["id"],
                "name": intv["name"],
                "domain": intv["domain"],
                "target_metric": intv["target_metric"],
                "description": intv["description"],
                "baseline_cepi_score": sim_res["baseline_cepi_score"],
                "projected_cepi_score": sim_res["projected_cepi_score"],
                "estimated_cepi_improvement": sim_res["cepi_delta"],
                "confidence": intv["confidence"],
                "assumptions": intv["assumptions"],
                "provenance": "DECISION_SUPPORT",
                "disclaimer": "Intervention projections evaluate decision-support scenarios and do not guarantee legal compliance or instant physical remediation."
            })

        return evaluations
