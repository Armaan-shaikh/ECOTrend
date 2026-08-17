from typing import List, Dict, Any
from app.core.standards_noise import (
    NOISE_STANDARDS,
    CONTEXTUAL_ACOUSTIC_DECIBEL_GUIDELINES,
    NOISE_METHODOLOGY_METADATA,
    get_noise_category
)

class NoiseHealthScoringEngine:
    """
    Acoustic Disturbance Intelligence Scoring Engine (EcoTrend Acoustic Index v1.0):
    Calculates 0-100 score for NOISE_INCIDENTS based on measured daily incident density,
    explicitly marks acoustic decibel metrics (Lden, Lnight, Lday, LAeq) as UNAVAILABLE (never fabricating dBA values),
    and preserves MEASURED data provenance.
    """

    UNAVAILABLE_DBA_METRICS = [
        {"metric": "Lden", "title": "Day-Evening-Night Level", "unit": "dBA", "standard": "WHO (2018) Traffic Limit 53 dBA"},
        {"metric": "Lnight", "title": "Nighttime Sound Level", "unit": "dBA", "standard": "WHO Night Limit 45 dBA"},
        {"metric": "Lday", "title": "Daytime Sound Level", "unit": "dBA", "standard": "US EPA Residential 55 dBA"},
        {"metric": "LAeq", "title": "Continuous Equivalent Level", "unit": "dBA", "standard": "WMO Biometeorological Norms"}
    ]

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str) -> Dict[str, Any]:
        std = NOISE_STANDARDS.get(metric)
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

        if metric == "NOISE_INCIDENTS":
            if raw_value <= 0.0:
                score = 100.0
            elif raw_value <= 2.0:
                score = 85.0 + 15.0 * ((2.0 - raw_value) / 2.0)
            elif raw_value <= 5.0:
                score = 65.0 + 20.0 * ((5.0 - raw_value) / 3.0)
            elif raw_value <= 10.0:
                score = 45.0 + 20.0 * ((10.0 - raw_value) / 5.0)
            else:
                score = max(0.0, 45.0 - 45.0 * ((raw_value - 10.0) / 10.0))

        score_int = int(round(max(0.0, min(100.0, score))))
        cat_info = get_noise_category(score_int)

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
            "contribution_pct": 100.0
        }

    @staticmethod
    def compute_aggregate_noise_score(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        latest_incidents = None
        provenance_sources = set()
        data_types = set()

        for m in measurements:
            if m.get("metric") == "NOISE_INCIDENTS" and m.get("data_quality") != "INVALID":
                latest_incidents = m
                if m.get("source"):
                    provenance_sources.add(m.get("source"))
                if m.get("data_type"):
                    data_types.add(m.get("data_type"))
                break

        subscores = []

        if latest_incidents:
            sub = NoiseHealthScoringEngine.compute_metric_subscore(
                "NOISE_INCIDENTS",
                latest_incidents.get("value"),
                latest_incidents.get("unit", "incidents/day")
            )
            subscores.append(sub)
            aggregate_score = sub["score"]
            data_coverage_pct = 100.0
        else:
            std = NOISE_STANDARDS["NOISE_INCIDENTS"]
            subscores.append({
                "metric": "NOISE_INCIDENTS",
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
            aggregate_score = 85
            data_coverage_pct = 0.0

        # Add explicit UNAVAILABLE decibel metric entries
        for unavailable_metric in NoiseHealthScoringEngine.UNAVAILABLE_DBA_METRICS:
            subscores.append({
                "metric": unavailable_metric["metric"],
                "title": unavailable_metric["title"],
                "raw_value": None,
                "unit": unavailable_metric["unit"],
                "score": 0,
                "category": "UNAVAILABLE",
                "standard": unavailable_metric["standard"],
                "reference_type": "PROJECT_DEFINED_METHODOLOGY",
                "weight": 0.0,
                "is_available": False,
                "contribution_pct": 0.0
            })

        cat_info = get_noise_category(aggregate_score)

        dt_str = " / ".join(data_types) if data_types else "MEASURED"
        src_str = " / ".join(provenance_sources) if provenance_sources else "NYC_OpenData_311"

        explanation = (
            f"Acoustic Disturbance Index: {aggregate_score}/100 — {cat_info['category']}. "
            f"Data coverage is {data_coverage_pct}% ({dt_str} from {src_str}). "
            f"Note: Continuous decibel sound levels (dBA) are unavailable on public feeds and marked UNAVAILABLE."
        )

        return {
            "overall_noise_score": aggregate_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": data_coverage_pct,
            "data_type": dt_str,
            "source_provenance": src_str,
            "explanation": explanation,
            "metric_subscores": subscores,
            "contextual_decibel_guidelines": CONTEXTUAL_ACOUSTIC_DECIBEL_GUIDELINES,
            "methodology": NOISE_METHODOLOGY_METADATA
        }
