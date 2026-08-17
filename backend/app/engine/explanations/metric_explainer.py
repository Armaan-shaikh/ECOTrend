from typing import Dict, Any, List
from app.engine.explanations.templates import METRIC_DEFINITIONS

class MetricExplainer:
    """
    Metric Explainer:
    Provides plain-language scientific explanations for PM2.5, PM10, NO2, SO2, O3, CO, and AQI.
    """

    @staticmethod
    def get_metric_explanation(metric_name: str) -> Dict[str, str]:
        key = metric_name.upper()
        if key in METRIC_DEFINITIONS:
            return METRIC_DEFINITIONS[key]
        return {
            "metric": metric_name,
            "title": f"{metric_name} Metric",
            "definition": f"{metric_name} is an environmental air quality parameter.",
            "common_sources": "Various urban, industrial, and natural sources.",
            "health_relevance": "Monitored to assess environmental safety and public health."
        }

    @staticmethod
    def get_all_metric_definitions() -> List[Dict[str, str]]:
        return list(METRIC_DEFINITIONS.values())
