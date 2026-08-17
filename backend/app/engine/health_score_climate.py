from typing import List, Dict, Any
from app.core.standards_climate import (
    CLIMATE_STANDARDS,
    CLIMATE_METHODOLOGY_METADATA,
    get_climate_category
)

class ClimateHealthScoringEngine:
    """
    Climate Quality Health Scoring Engine (EcoTrend Climate Index v1.0):
    Calculates sub-scores (0-100) for T_ANOMALY, T2M, PRECIP, RH2M, and WS10M,
    tracks data coverage %, computes weighted aggregate Climate Index, and preserves data provenance (REANALYSIS vs MEASURED vs DERIVED).
    """

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str) -> Dict[str, Any]:
        std = CLIMATE_STANDARDS.get(metric)
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

        if metric == "T_ANOMALY":
            abs_anom = abs(raw_value)
            if abs_anom <= 0.5:
                score = 100.0
            elif abs_anom <= 1.5:
                score = 90.0 - 15.0 * ((abs_anom - 0.5) / 1.0)
            elif abs_anom <= 3.0:
                score = 75.0 - 30.0 * ((abs_anom - 1.5) / 1.5)
            else:
                score = max(0.0, 45.0 - 45.0 * ((abs_anom - 3.0) / 2.0))

        elif metric == "T2M":
            if 15.0 <= raw_value <= 25.0:
                score = 100.0
            elif 10.0 <= raw_value < 15.0:
                score = 75.0 + 25.0 * ((raw_value - 10.0) / 5.0)
            elif 25.0 < raw_value <= 30.0:
                score = 90.0 - 15.0 * ((raw_value - 25.0) / 5.0)
            else:
                diff = min(abs(raw_value - 10.0), abs(raw_value - 30.0))
                score = max(0.0, 75.0 - 25.0 * (diff / 10.0))

        elif metric == "RH2M":
            if 35.0 <= raw_value <= 65.0:
                score = 100.0
            elif 25.0 <= raw_value < 35.0:
                score = 75.0 + 25.0 * ((raw_value - 25.0) / 10.0)
            elif 65.0 < raw_value <= 75.0:
                score = 90.0 - 15.0 * ((raw_value - 65.0) / 10.0)
            else:
                diff = min(abs(raw_value - 25.0), abs(raw_value - 75.0))
                score = max(0.0, 75.0 - 25.0 * (diff / 15.0))

        elif metric in ["PRECIP", "WS10M"]:
            opt_max = std.get("optimal_max", 25.0)
            mod_max = std.get("moderate_max", 75.0)
            crit_max = std.get("critical_max", 150.0)

            if raw_value <= opt_max:
                score = 100.0
            elif raw_value <= mod_max:
                score = 90.0 - 15.0 * ((raw_value - opt_max) / max(0.01, mod_max - opt_max))
            else:
                score = max(0.0, 75.0 - 75.0 * ((raw_value - mod_max) / max(0.01, crit_max - mod_max)))

        score_int = int(round(max(0.0, min(100.0, score))))
        cat_info = get_climate_category(score_int)

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
    def compute_aggregate_climate_score(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        latest_by_metric: Dict[str, Dict[str, Any]] = {}
        for m in measurements:
            metric = m.get("metric")
            if metric in CLIMATE_STANDARDS and m.get("data_quality") != "INVALID":
                latest_by_metric[metric] = m

        subscores = []
        total_available_weight = 0.0
        weighted_score_sum = 0.0

        all_supported = list(CLIMATE_STANDARDS.keys())
        provenance_sources = set()
        data_types = set()

        for metric in all_supported:
            std = CLIMATE_STANDARDS[metric]
            m = latest_by_metric.get(metric)

            if m:
                sub = ClimateHealthScoringEngine.compute_metric_subscore(metric, m.get("value"), m.get("unit", std["unit"]))
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
            aggregate_score = 75

        cat_info = get_climate_category(aggregate_score)

        dt_str = " / ".join(data_types) if data_types else "REANALYSIS"
        src_str = " / ".join(provenance_sources) if provenance_sources else "Open-Meteo_ERA5"

        explanation = (
            f"Climate Index: {aggregate_score}/100 — {cat_info['category']}. "
            f"Data coverage is {data_coverage_pct}% ({dt_str} from {src_str})."
        )

        return {
            "overall_climate_score": aggregate_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": data_coverage_pct,
            "data_type": dt_str,
            "source_provenance": src_str,
            "explanation": explanation,
            "metric_subscores": subscores,
            "methodology": CLIMATE_METHODOLOGY_METADATA
        }
