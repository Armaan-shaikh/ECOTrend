from typing import List, Dict, Any
from app.core.standards_water import WATER_QUALITY_STANDARDS, WATER_METHODOLOGY_METADATA, get_water_category

class WaterHealthScoringEngine:
    """
    Water Quality Health Scoring Engine (EcoTrend Water Methodology v1.0):
    Calculates sub-scores (0-100) for DO, BOD, COD, TDS, pH, Turbidity, Temp, Conductivity,
    tracks data coverage, and computes weighted aggregate Water Quality Score.
    """

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str) -> Dict[str, Any]:
        std = WATER_QUALITY_STANDARDS.get(metric)
        if not std or raw_value is None:
            return {
                "metric": metric,
                "raw_value": None,
                "unit": unit,
                "score": 0,
                "category": "N/A",
                "standard": "UNAVAILABLE",
                "weight": std["weight"] if std else 0.0,
                "is_available": False,
                "contribution_pct": 0.0
            }

        score = 100.0

        if metric == "DO":
            if raw_value >= 6.5:
                score = 100.0
            elif raw_value >= 5.0:
                score = 75.0 + 15.0 * ((raw_value - 5.0) / 1.5)
            elif raw_value >= 2.0:
                score = 45.0 + 30.0 * ((raw_value - 2.0) / 3.0)
            else:
                score = max(0.0, 45.0 * (raw_value / 2.0))

        elif metric in ["BOD", "COD", "TDS", "Turbidity", "Conductivity"]:
            opt_max = std.get("optimal_max", 5.0)
            mod_max = std.get("moderate_max", 10.0)
            crit_max = std.get("critical_max", 50.0)

            if raw_value <= opt_max:
                score = 100.0 - 10.0 * (raw_value / max(1.0, opt_max))
            elif raw_value <= mod_max:
                score = 90.0 - 15.0 * ((raw_value - opt_max) / max(1.0, mod_max - opt_max))
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - mod_max) / max(1.0, crit_max - mod_max)))

        elif metric == "pH":
            if 6.5 <= raw_value <= 8.5:
                score = 100.0
            elif 6.0 <= raw_value < 6.5:
                score = 75.0 + 25.0 * ((raw_value - 6.0) / 0.5)
            elif 8.5 < raw_value <= 9.0:
                score = 90.0 - 15.0 * ((raw_value - 8.5) / 0.5)
            else:
                diff = min(abs(raw_value - 6.0), abs(raw_value - 9.0))
                score = max(0.0, 75.0 - 25.0 * diff)

        elif metric == "Temp":
            if 10.0 <= raw_value <= 22.0:
                score = 100.0
            elif 22.0 < raw_value <= 25.0:
                score = 90.0 - 15.0 * ((raw_value - 22.0) / 3.0)
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - 25.0) / 10.0))

        score_int = int(round(max(0.0, min(100.0, score))))
        cat_info = get_water_category(score_int)

        return {
            "metric": metric,
            "raw_value": round(raw_value, 2),
            "unit": unit,
            "score": score_int,
            "category": cat_info["category"],
            "standard": std["standard_reference"],
            "weight": std["weight"],
            "is_available": True,
            "contribution_pct": 0.0
        }

    @staticmethod
    def compute_aggregate_water_score(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        latest_by_metric: Dict[str, Dict[str, Any]] = {}
        for m in measurements:
            metric = m.get("metric")
            if metric in WATER_QUALITY_STANDARDS and m.get("data_quality") != "INVALID":
                latest_by_metric[metric] = m

        subscores = []
        total_available_weight = 0.0
        weighted_score_sum = 0.0

        all_supported = list(WATER_QUALITY_STANDARDS.keys())

        for metric in all_supported:
            std = WATER_QUALITY_STANDARDS[metric]
            m = latest_by_metric.get(metric)

            if m:
                sub = WaterHealthScoringEngine.compute_metric_subscore(metric, m.get("value"), m.get("unit", std["unit"]))
                subscores.append(sub)
                total_available_weight += std["weight"]
                weighted_score_sum += sub["score"] * std["weight"]
            else:
                subscores.append({
                    "metric": metric,
                    "raw_value": None,
                    "unit": std["unit"],
                    "score": 0,
                    "category": "N/A",
                    "standard": std["standard_reference"],
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

        cat_info = get_water_category(aggregate_score)

        # Primary negative driver (lowest sub-score)
        avail_subs = [s for s in subscores if s["is_available"]]
        if avail_subs:
            primary_driver = min(avail_subs, key=lambda s: s["score"])["metric"]
        else:
            primary_driver = "None"

        explanation = (
            f"Water Quality Score: {aggregate_score}/100 — {cat_info['category']}. "
            f"{primary_driver} is the primary driver of score reduction. "
            f"Data coverage is {data_coverage_pct}% based on active water monitoring feeds."
        )

        return {
            "overall_water_score": aggregate_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": data_coverage_pct,
            "primary_water_driver": primary_driver,
            "explanation": explanation,
            "metric_subscores": subscores,
            "methodology": WATER_METHODOLOGY_METADATA
        }
