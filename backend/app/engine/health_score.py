import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from app.core.standards import (
    AIR_QUALITY_STANDARDS, 
    SCORE_CATEGORIES, 
    METHODOLOGY_METADATA,
    get_category_for_score
)

class EHSScoringEngine:
    """
    EcoTrend Air Health Scoring Engine (Methodology v1.0):
    - Converts raw pollutant measurements into normalized 0–100 sub-scores
    - Handles missing metrics with explicit coverage % reporting
    - Computes weighted aggregate EHS using configurable epidemiological weights
    - Converts historical measurements and Phase 2A forecast projections into EHS series
    - Generates deterministic plain-language narrative summaries (No LLM)
    """

    @staticmethod
    def compute_metric_subscore(metric: str, raw_value: float, unit: str = "µg/m³") -> Dict[str, Any]:
        cfg = AIR_QUALITY_STANDARDS.get(metric.upper())
        if not cfg or raw_value is None or raw_value < 0:
            return {
                "metric": metric,
                "raw_value": raw_value if raw_value is not None else 0.0,
                "unit": unit,
                "score": 0,
                "category": "Unavailable",
                "standard": "Unknown",
                "weight": 0.0,
                "is_available": False,
                "contribution_pct": 0.0
            }

        who_annual = cfg["who_annual"]
        who_24h = cfg["who_24h"]
        val = float(raw_value)

        # Piecewise Normalization Algorithm (EcoTrend Methodology v1.0)
        if val <= who_annual:
            # Pristine / Excellent range [90, 100]
            if who_annual > 0:
                score = 100.0 - 10.0 * (val / who_annual)
            else:
                score = 100.0
        elif val <= who_24h:
            # Good / Acceptable range [75, 90)
            range_val = who_24h - who_annual
            if range_val > 0:
                score = 90.0 - 15.0 * ((val - who_annual) / range_val)
            else:
                score = 85.0
        else:
            # Beyond 24h safety limit: decays toward 0
            excess = val - who_24h
            # Decay scale: 4x 24h limit brings score near zero
            decay_scale = max(1.0, 4.0 * who_24h)
            score = max(0.0, 75.0 - 75.0 * (excess / decay_scale))

        score_int = int(round(score))
        cat_info = get_category_for_score(score_int)

        return {
            "metric": cfg["metric"],
            "raw_value": round(val, 2),
            "unit": cfg["unit"],
            "score": score_int,
            "category": cat_info["category"],
            "standard": cfg["standard_reference"],
            "weight": cfg["weight"],
            "is_available": True,
            "contribution_pct": 0.0 # Computed during aggregate pass
        }

    @staticmethod
    def compute_aggregate_ehs(measurements: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Track available metrics
        subscores = []
        available_map = {}

        for m in measurements:
            metric_name = m.get("metric", "").upper()
            val = m.get("value")
            if metric_name in AIR_QUALITY_STANDARDS and metric_name not in available_map:
                available_map[metric_name] = (val, m.get("unit", "µg/m³"))

        total_possible_weight = sum(cfg["weight"] for cfg in AIR_QUALITY_STANDARDS.values() if cfg["weight"] > 0)
        accumulated_weight = 0.0
        weighted_score_sum = 0.0

        all_subscores = []
        primary_driver = None
        min_subscore_val = 999.0

        # Compute sub-scores for all standard metrics
        for metric_name, cfg in AIR_QUALITY_STANDARDS.items():
            if cfg["weight"] == 0.0 and metric_name == "AQI":
                # Handle secondary AQI metric separately if present
                if "AQI" in available_map:
                    val, unit = available_map["AQI"]
                    all_subscores.append(EHSScoringEngine.compute_metric_subscore("AQI", val, unit))
                continue

            if metric_name in available_map:
                val, unit = available_map[metric_name]
                sub_res = EHSScoringEngine.compute_metric_subscore(metric_name, val, unit)
                all_subscores.append(sub_res)

                if sub_res["is_available"]:
                    w = cfg["weight"]
                    accumulated_weight += w
                    weighted_score_sum += sub_res["score"] * w

                    if sub_res["score"] < min_subscore_val:
                        min_subscore_val = sub_res["score"]
                        primary_driver = sub_res
            else:
                # Mark missing metric unavailable
                all_subscores.append({
                    "metric": metric_name,
                    "raw_value": None,
                    "unit": cfg["unit"],
                    "score": 0,
                    "category": "Unavailable",
                    "standard": cfg["standard_reference"],
                    "weight": cfg["weight"],
                    "is_available": False,
                    "contribution_pct": 0.0
                })

        # Calculate Coverage %
        coverage_pct = round((accumulated_weight / (total_possible_weight or 1.0)) * 100.0, 1)

        if accumulated_weight > 0:
            overall_score = int(round(weighted_score_sum / accumulated_weight))
        else:
            overall_score = 50 # Default baseline if no metrics are available

        cat_info = get_category_for_score(overall_score)

        # Compute contribution % of each available metric
        for sub in all_subscores:
            if sub["is_available"] and sub["weight"] > 0 and accumulated_weight > 0:
                sub["contribution_pct"] = round((sub["weight"] / accumulated_weight) * 100.0, 1)

        # Generate Deterministic Explanation
        explanation = EHSScoringEngine.build_deterministic_explanation(
            overall_score=overall_score,
            category=cat_info["category"],
            primary_driver=primary_driver,
            coverage_pct=coverage_pct
        )

        return {
            "overall_ehs": overall_score,
            "category": cat_info["category"],
            "color": cat_info["color"],
            "health_impact": cat_info["health_impact"],
            "data_coverage_percent": coverage_pct,
            "primary_pollutant_driver": primary_driver["metric"] if primary_driver else "None",
            "explanation": explanation,
            "metric_subscores": all_subscores,
            "methodology": METHODOLOGY_METADATA
        }

    @staticmethod
    def compute_historical_ehs_series(measurements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not measurements:
            return []

        df = pd.DataFrame(measurements)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["date"] = df["timestamp"].dt.strftime("%Y-%m-%d")

        grouped = df.groupby("date")
        series = []

        for date_str, group in grouped:
            group_records = group.to_dict(orient="records")
            ehs_res = EHSScoringEngine.compute_aggregate_ehs(group_records)
            series.append({
                "date": date_str,
                "timestamp": f"{date_str}T00:00:00Z",
                "overall_ehs": ehs_res["overall_ehs"],
                "category": ehs_res["category"],
                "color": ehs_res["color"],
                "data_coverage_percent": ehs_res["data_coverage_percent"],
                "primary_pollutant_driver": ehs_res["primary_pollutant_driver"]
            })

        return sorted(series, key=lambda x: x["date"])

    @staticmethod
    def convert_forecast_to_ehs(forecast_response: Dict[str, Any]) -> List[Dict[str, Any]]:
        metric = forecast_response.get("metric", "PM2.5")
        projections = forecast_response.get("projections", [])
        unit = forecast_response.get("unit", "µg/m³")

        ehs_projections = []
        for p in projections:
            base_sub = EHSScoringEngine.compute_metric_subscore(metric, p["baseline_value"], unit)
            improv_sub = EHSScoringEngine.compute_metric_subscore(metric, p["improvement_value"], unit)
            worsen_sub = EHSScoringEngine.compute_metric_subscore(metric, p["worsening_value"], unit)

            ci_lower_sub = EHSScoringEngine.compute_metric_subscore(metric, p["ci_95_upper"], unit) # Higher concentration = Lower EHS
            ci_upper_sub = EHSScoringEngine.compute_metric_subscore(metric, p["ci_95_lower"], unit) # Lower concentration = Higher EHS

            ehs_projections.append({
                "date": p["date"],
                "timestamp": p["timestamp"],
                "baseline_ehs": base_sub["score"],
                "baseline_category": base_sub["category"],
                "improvement_ehs": improv_sub["score"],
                "worsening_ehs": worsen_sub["score"],
                "ehs_ci_95_lower": ci_lower_sub["score"],
                "ehs_ci_95_upper": ci_upper_sub["score"]
            })

        return ehs_projections

    @staticmethod
    def build_deterministic_explanation(
        overall_score: int, 
        category: str, 
        primary_driver: Optional[Dict[str, Any]], 
        coverage_pct: float
    ) -> str:
        base_str = f"Air Quality Score: {overall_score}/100 — {category}."

        if primary_driver and primary_driver.get("metric"):
            m_name = primary_driver["metric"]
            m_val = primary_driver["raw_value"]
            m_unit = primary_driver["unit"]
            driver_str = f" {m_name} ({m_val} {m_unit}) is the primary pollutant driver of score reduction."
        else:
            driver_str = " All monitored air metrics remain within baseline limits."

        cov_str = f" Data coverage is {coverage_pct}% based on active monitoring feeds."

        return f"{base_str}{driver_str}{cov_str}"
