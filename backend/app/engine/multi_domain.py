import numpy as np
from scipy import stats
from typing import List, Dict, Any, Optional, Tuple

BASELINE_DOMAIN_WEIGHTS = {
    "air": 0.20,
    "water": 0.20,
    "soil": 0.20,
    "climate": 0.15,
    "emissions": 0.15,
    "noise": 0.10
}

CAUSATION_DISCLAIMER = "Statistical correlation does not imply environmental causation."

class MultiDomainEngine:
    """
    Unified 6-Domain Environmental Intelligence Engine:
    - Calculates Composite Environmental Performance Index (CEPI: 0-100) with dynamic weight re-normalization.
    - Preserves 100% domain score isolation and data provenance.
    - Performs temporal + spatial pairing before computing dual Pearson (r) and Spearman (rho) correlations (n >= 10).
    """

    @staticmethod
    def calculate_cepi(domain_scores: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate CEPI from valid available domain scores.
        Missing/unavailable domains NEVER become 0 and DO NOT penalize CEPI.
        Exposes available_domains, missing_domains, data_coverage_percent, and weights_used (re-normalized to 100%).
        """
        available_domains = []
        missing_domains = []
        weights_used = {}
        total_available_weight = 0.0
        weighted_score_sum = 0.0

        for domain, weight in BASELINE_DOMAIN_WEIGHTS.items():
            d_info = domain_scores.get(domain)
            # Check if domain score is present, valid, and available
            if d_info and d_info.get("is_available", True) and d_info.get("score") is not None:
                score = float(d_info["score"])
                available_domains.append(domain)
                weights_used[domain] = weight
                total_available_weight += weight
                weighted_score_sum += score * weight
            else:
                missing_domains.append(domain)

        if total_available_weight > 0:
            cepi_score = int(round(weighted_score_sum / total_available_weight))
            # Normalize weights_used for display (e.g. sum to 100.0%)
            normalized_weights = {d: round((w / total_available_weight) * 100.0, 1) for d, w in weights_used.items()}
        else:
            cepi_score = 80
            normalized_weights = {}

        coverage_pct = round((total_available_weight / 1.0) * 100.0, 1)

        # CEPI Category Classification
        if cepi_score >= 90:
            category, color = "Pristine", "#10B981"
        elif cepi_score >= 75:
            category, color = "Good", "#06B6D4"
        elif cepi_score >= 60:
            category, color = "Moderate", "#F59E0B"
        elif cepi_score >= 45:
            category, color = "Unfavorable", "#F97316"
        else:
            category, color = "Critical", "#F43F5E"

        return {
            "cepi_score": cepi_score,
            "category": category,
            "color": color,
            "data_coverage_percent": coverage_pct,
            "available_domains_count": len(available_domains),
            "total_domains_count": 6,
            "available_domains": available_domains,
            "missing_domains": missing_domains,
            "weights_used": normalized_weights,
            "explanation": (
                f"Composite Environmental Performance Index: {cepi_score}/100 ({category}). "
                f"Calculated from {len(available_domains)}/6 valid environmental domains ({coverage_pct}% coverage). "
                f"Unavailable domains: {missing_domains or 'None'}."
            )
        }

    @staticmethod
    def align_time_series(
        records_a: List[Dict[str, Any]],
        records_b: List[Dict[str, Any]]
    ) -> Tuple[List[float], List[float]]:
        """
        Perform spatial + temporal alignment across two measurement series.
        Matches observations strictly on (location_id, date_stamp).
        """
        dict_a = {}
        for r in records_a:
            loc = r.get("location_id", "")
            ts = r.get("timestamp", "").split("T")[0]
            val = r.get("value")
            if loc and ts and val is not None and r.get("data_quality") != "INVALID":
                dict_a[(loc, ts)] = float(val)

        paired_a = []
        paired_b = []

        for r in records_b:
            loc = r.get("location_id", "")
            ts = r.get("timestamp", "").split("T")[0]
            val = r.get("value")
            if loc and ts and val is not None and r.get("data_quality") != "INVALID":
                key = (loc, ts)
                if key in dict_a:
                    paired_a.append(dict_a[key])
                    paired_b.append(float(val))

        return paired_a, paired_b

    @staticmethod
    def compute_cross_domain_correlation(
        series_a: List[float],
        series_b: List[float],
        metric_a: str,
        metric_b: str
    ) -> Dict[str, Any]:
        """
        Calculate dual Pearson (r) and Spearman (rho) correlations.
        Requires n >= 10 aligned observation pairs.
        """
        # Filter out NaN/None pairs
        paired = [(a, b) for a, b in zip(series_a, series_b) if a is not None and b is not None and not np.isnan(a) and not np.isnan(b)]
        n = len(paired)

        if n < 10:
            return {
                "metric_a": metric_a,
                "metric_b": metric_b,
                "sample_size": n,
                "status": "INSUFFICIENT_DATA",
                "pearson_r": None,
                "spearman_rho": None,
                "p_value": None,
                "is_statistically_significant": False,
                "disclaimer": CAUSATION_DISCLAIMER,
                "explanation": f"Insufficient temporally/spatially aligned observation pairs (n={n} < 10 threshold required for correlation)."
            }

        arr_a = np.array([p[0] for p in paired])
        arr_b = np.array([p[1] for p in paired])

        # Check for constant series
        if np.std(arr_a) == 0 or np.std(arr_b) == 0:
            return {
                "metric_a": metric_a,
                "metric_b": metric_b,
                "sample_size": n,
                "status": "CONSTANT_VARIANCE",
                "pearson_r": 0.0,
                "spearman_rho": 0.0,
                "p_value": 1.0,
                "is_statistically_significant": False,
                "disclaimer": CAUSATION_DISCLAIMER,
                "explanation": f"Zero variance detected in input metric series."
            }

        p_res = stats.pearsonr(arr_a, arr_b)
        s_res = stats.spearmanr(arr_a, arr_b)

        r_val = float(p_res.statistic)
        rho_val = float(s_res.statistic)
        p_val = float(p_res.pvalue)
        is_sig = p_val < 0.05

        if abs(r_val) >= 0.7:
            relationship = "Strong"
        elif abs(r_val) >= 0.4:
            relationship = "Moderate"
        else:
            relationship = "Weak"

        direction = "Positive" if r_val > 0 else "Inverse"

        return {
            "metric_a": metric_a,
            "metric_b": metric_b,
            "sample_size": n,
            "status": "VALID",
            "pearson_r": round(r_val, 3),
            "spearman_rho": round(rho_val, 3),
            "p_value": round(p_val, 4),
            "is_statistically_significant": is_sig,
            "relationship_type": f"{relationship} {direction}",
            "disclaimer": CAUSATION_DISCLAIMER,
            "explanation": (
                f"{relationship} {direction} correlation (Pearson r={round(r_val, 2)}, Spearman ρ={round(rho_val, 2)}, "
                f"n={n}, p={round(p_val, 4)}). {CAUSATION_DISCLAIMER}"
            )
        }
