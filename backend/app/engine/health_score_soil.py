from typing import List, Dict, Any
from app.core.standards_soil import (
    SOIL_QUALITY_STANDARDS,
    SOIL_METHODOLOGY_METADATA,
    REFERENCE_TYPES,
    get_soil_category
)

class SoilHealthScoringEngine:
    """
    Soil Quality Health Scoring Engine (EcoTrend Soil Methodology v1.0):
    Calculates sub-scores (0-100) for SOC, pH, Pb, Cd, As, Hg, Cr, TPH, EC, and Moisture,
    tracks data coverage, computes weighted aggregate Soil Quality Score, and preserves data provenance (MEASURED vs MODELED_ESTIMATE).
    """

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str) -> Dict[str, Any]:
        std = SOIL_QUALITY_STANDARDS.get(metric)
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

        if metric == "SOC":
            if raw_value >= 2.0:
                score = 100.0
            elif raw_value >= 1.0:
                score = 75.0 + 25.0 * ((raw_value - 1.0) / 1.0)
            elif raw_value >= 0.2:
                score = 45.0 + 30.0 * ((raw_value - 0.2) / 0.8)
            else:
                score = max(0.0, 45.0 * (raw_value / 0.2))

        elif metric == "pH":
            if 6.0 <= raw_value <= 7.8:
                score = 100.0
            elif 5.5 <= raw_value < 6.0:
                score = 75.0 + 25.0 * ((raw_value - 5.5) / 0.5)
            elif 7.8 < raw_value <= 8.2:
                score = 90.0 - 15.0 * ((raw_value - 7.8) / 0.4)
            else:
                diff = min(abs(raw_value - 5.5), abs(raw_value - 8.2))
                score = max(0.0, 75.0 - 25.0 * diff)

        elif metric in ["Pb", "Cd", "As", "Hg", "Cr", "TPH", "EC"]:
            opt_max = std.get("optimal_max", 50.0)
            mod_max = std.get("moderate_max", 200.0)
            crit_max = std.get("critical_max", 800.0)

            if raw_value <= opt_max:
                score = 100.0 - 10.0 * (raw_value / max(0.01, opt_max))
            elif raw_value <= mod_max:
                score = 90.0 - 15.0 * ((raw_value - opt_max) / max(0.01, mod_max - opt_max))
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - mod_max) / max(0.01, crit_max - mod_max)))

        elif metric == "Moisture":
            if 15.0 <= raw_value <= 35.0:
                score = 100.0
            elif 10.0 <= raw_value < 15.0:
                score = 75.0 + 25.0 * ((raw_value - 10.0) / 5.0)
            elif 35.0 < raw_value <= 45.0:
                score = 90.0 - 15.0 * ((raw_value - 35.0) / 10.0)
            else:
                diff = min(abs(raw_value - 10.0), abs(raw_value - 45.0))
                score = max(0.0, 75.0 - 25.0 * (diff / 10.0))

        score_int = int(round(max(0.0, min(100.0, score))))
        cat_info = get_soil_category(score_int)

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
    def compute_aggregate_soil_score(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        latest_by_metric: Dict[str, Dict[str, Any]] = {}
        for m in measurements:
            metric = m.get("metric")
            if metric in SOIL_QUALITY_STANDARDS and m.get("data_quality") != "INVALID":
                latest_by_metric[metric] = m

        subscores = []
        total_available_weight = 0.0
        weighted_score_sum = 0.0

        all_supported = list(SOIL_QUALITY_STANDARDS.keys())
        provenance_sources = set()
        data_types = set()

        for metric in all_supported:
            std = SOIL_QUALITY_STANDARDS[metric]
            m = latest_by_metric.get(metric)

            if m:
                sub = SoilHealthScoringEngine.compute_metric_subscore(metric, m.get("value"), m.get("unit", std["unit"]))
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
            aggregate_score = 50

        cat_info = get_soil_category(aggregate_score)

        # Primary driver
        avail_subs = [s for s in subscores if s["is_available"]]
        if avail_subs:
            primary_driver = min(avail_subs, key=lambda s: s["score"])["title"]
        else:
            primary_driver = "None"

        dt_str = " / ".join(data_types) if data_types else "MODELED_ESTIMATE"
        src_str = " / ".join(provenance_sources) if provenance_sources else "SoilGrids v2.0"

        explanation = (
            f"Soil Quality Score: {aggregate_score}/100 — {cat_info['category']}. "
            f"{primary_driver} is the primary driver of score evaluation. "
            f"Data coverage is {data_coverage_pct}% ({dt_str} from {src_str})."
        )

        return {
            "overall_soil_score": aggregate_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": data_coverage_pct,
            "primary_soil_driver": primary_driver,
            "data_type": dt_str,
            "source_provenance": src_str,
            "explanation": explanation,
            "metric_subscores": subscores,
            "reference_types": REFERENCE_TYPES,
            "methodology": SOIL_METHODOLOGY_METADATA
        }
