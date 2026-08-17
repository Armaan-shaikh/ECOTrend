from typing import List, Dict, Any
from app.core.standards_emissions import (
    EMISSIONS_STANDARDS,
    EMISSIONS_METHODOLOGY_METADATA,
    get_emissions_category
)

class EmissionsHealthScoringEngine:
    """
    Emissions Sustainability Scoring Engine (EcoTrend Emissions Sustainability Index v1.0):
    Calculates sub-scores (0-100) for CO2_PER_CAPITA, CO2_PPM, and CO2E_TOTAL,
    tracks data coverage %, computes weighted aggregate Emissions Sustainability Score, and preserves data provenance (ESTIMATED vs MEASURED).
    """

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str) -> Dict[str, Any]:
        std = EMISSIONS_STANDARDS.get(metric)
        if not std or raw_value is None:
            return {
                "metric": metric,
                "title": std["title"] if std else metric,
                "raw_value": None,
                "unit": unit,
                "score": 0,
                "category": "N/A",
                "standard": std["standard_reference"] if std else "UNAVAILABLE",
                "reference_type": std["reference_type"] if std else "PROJECT_DEFINED_METHODOLOGY",
                "weight": std["weight"] if std else 0.0,
                "is_available": False,
                "contribution_pct": 0.0
            }

        score = 100.0

        if metric == "CO2_PER_CAPITA":
            # Target <= 2.0 tCO2/capita (Paris 1.5C) -> Score 100
            # Global average ~ 4.7 -> Score 75
            # > 15.0 -> Score 0
            if raw_value <= 2.0:
                score = 100.0
            elif raw_value <= 4.7:
                score = 90.0 - 15.0 * ((raw_value - 2.0) / 2.7)
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - 4.7) / 10.3))

        elif metric == "CO2_PPM":
            # Pre-industrial 280 -> 100, Target 350 -> 90, Current ~ 420 -> 65, > 600 -> 0
            if raw_value <= 280.0:
                score = 100.0
            elif raw_value <= 350.0:
                score = 90.0 + 10.0 * ((350.0 - raw_value) / 70.0)
            elif raw_value <= 425.0:
                score = 65.0 + 25.0 * ((425.0 - raw_value) / 75.0)
            else:
                score = max(0.0, 65.0 - 65.0 * ((raw_value - 425.0) / 175.0))

        elif metric == "CO2E_TOTAL":
            opt_max = std.get("optimal_max", 10.0)
            mod_max = std.get("moderate_max", 100.0)
            crit_max = std.get("critical_max", 1000.0)

            if raw_value <= opt_max:
                score = 100.0
            elif raw_value <= mod_max:
                score = 90.0 - 15.0 * ((raw_value - opt_max) / max(0.01, mod_max - opt_max))
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - mod_max) / max(0.01, crit_max - mod_max)))

        score_int = int(round(max(0.0, min(100.0, score))))
        cat_info = get_emissions_category(score_int)

        return {
            "metric": metric,
            "title": std["title"],
            "raw_value": round(raw_value, 2),
            "unit": unit,
            "score": score_int,
            "category": cat_info["category"],
            "standard": std["standard_reference"],
            "reference_type": std["reference_type"],
            "weight": std["weight"],
            "is_available": True,
            "contribution_pct": 0.0
        }

    @staticmethod
    def compute_aggregate_emissions_score(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        latest_by_metric: Dict[str, Dict[str, Any]] = {}
        for m in measurements:
            metric = m.get("metric")
            if metric in EMISSIONS_STANDARDS and m.get("data_quality") != "INVALID":
                latest_by_metric[metric] = m

        subscores = []
        total_available_weight = 0.0
        weighted_score_sum = 0.0

        all_supported = list(EMISSIONS_STANDARDS.keys())
        provenance_sources = set()
        data_types = set()

        for metric in all_supported:
            std = EMISSIONS_STANDARDS[metric]
            m = latest_by_metric.get(metric)

            if m:
                sub = EmissionsHealthScoringEngine.compute_metric_subscore(metric, m.get("value"), m.get("unit", std["unit"]))
                subscores.append(sub)
                total_available_weight += std["weight"]
                weighted_score_sum += sub["score"] * std["weight"]

                if m.get("source"):
                    provenance_sources.add(m.get("source"))
                if m.get("data_type"):
                    data_types.add(m.get("data_type"))
            else:
                subscores.append({
                    "metric": metric,
                    "title": std["title"],
                    "raw_value": None,
                    "unit": std["unit"],
                    "score": 0,
                    "category": "N/A",
                    "standard": std["standard_reference"],
                    "reference_type": std["reference_type"],
                    "weight": std["weight"],
                    "is_available": False,
                    "contribution_pct": 0.0
                })

        data_coverage_pct = round((total_available_weight / 1.0) * 100.0, 1)

        if total_available_weight > 0:
            aggregate_score = int(round(weighted_score_sum / total_available_weight))
            for sub in subscores:
                if sub["is_available"]:
                    sub["contribution_pct"] = round(((sub["score"] * sub["weight"]) / weighted_score_sum) * 100.0, 1)
        else:
            aggregate_score = 65

        cat_info = get_emissions_category(aggregate_score)

        dt_str = " / ".join(data_types) if data_types else "ESTIMATED"
        src_str = " / ".join(provenance_sources) if provenance_sources else "WorldBank_UNFCCC"

        explanation = (
            f"Emissions Sustainability Index: {aggregate_score}/100 — {cat_info['category']}. "
            f"Data coverage is {data_coverage_pct}% ({dt_str} from {src_str})."
        )

        return {
            "overall_emissions_score": aggregate_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": data_coverage_pct,
            "data_type": dt_str,
            "source_provenance": src_str,
            "explanation": explanation,
            "metric_subscores": subscores,
            "methodology": EMISSIONS_METHODOLOGY_METADATA
        }
