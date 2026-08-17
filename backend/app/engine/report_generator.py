from datetime import datetime, timezone
from typing import List, Dict, Any

class EHSReportGenerator:
    """
    Automated EHS Standards & Guidelines Audit Report Generator:
    Generates structured JSON and Markdown audit reports summarizing 6-domain environmental health,
    standards evaluation logs, compounding risk matrix, and data provenance audit trails.
    """

    @staticmethod
    def generate_json_report(
        location_id: str,
        location_name: str,
        evaluations: List[Dict[str, Any]],
        risk_summary: Dict[str, Any],
        cepi_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        now_str = datetime.now(timezone.utc).isoformat()

        return {
            "report_title": "EHS Standards & Guidelines Audit Report",
            "generated_at": now_str,
            "location_id": location_id,
            "location_name": location_name,
            "executive_summary": {
                "cepi_score": cepi_summary.get("cepi_score"),
                "cepi_category": cepi_summary.get("category"),
                "compounding_risk_score": risk_summary.get("compounding_risk_score"),
                "risk_tier": risk_summary.get("risk_tier"),
                "total_standards_evaluated": len(evaluations),
                "exceeded_standards_count": risk_summary.get("exceeded_rules_count"),
                "compliance_rate_percent": round(
                    ((len(evaluations) - risk_summary.get("exceeded_rules_count", 0)) / max(len(evaluations), 1)) * 100.0, 1
                )
            },
            "risk_assessment": risk_summary,
            "cepi_overview": cepi_summary,
            "evaluations_detail": evaluations,
            "audit_metadata": {
                "engine": "EcoTrend Standards Evaluation Engine v1.0",
                "disclaimer": "This document is an EHS Standards & Guidelines Audit Report evaluating international guidelines, policy targets, benchmarks, and project-defined criteria."
            }
        }

    @staticmethod
    def generate_markdown_report(
        location_id: str,
        location_name: str,
        evaluations: List[Dict[str, Any]],
        risk_summary: Dict[str, Any],
        cepi_summary: Dict[str, Any]
    ) -> str:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        md = []
        md.append(f"# EHS Standards & Guidelines Audit Report")
        md.append(f"**Location:** {location_name} (`{location_id}`)\n**Generated At:** {now_str}\n")
        md.append("---")
        md.append("## Executive Summary")
        md.append(f"- **Composite Environmental Index (CEPI):** {cepi_summary.get('cepi_score')}/100 ({cepi_summary.get('category')})")
        md.append(f"- **EcoTrend Compounding Risk Index:** {risk_summary.get('compounding_risk_score')}/100 ({risk_summary.get('risk_tier')})")
        md.append(f"- **Standards Compliance Rate:** {round(((len(evaluations) - risk_summary.get('exceeded_rules_count', 0)) / max(len(evaluations), 1)) * 100.0, 1)}%\n")

        md.append("## Evaluated Environmental Standards & Guidelines")
        md.append("| Domain | Metric | Observed | Threshold | Averaging Period | Reference Standard | Reference Type | Evaluation Severity |")
        md.append("|---|---|---|---|---|---|---|---|")

        for ev in evaluations:
            md.append(
                f"| {ev.get('domain').upper()} | {ev.get('metric')} | {ev.get('observed_value')} {ev.get('unit')} | "
                f"{ev.get('threshold')} {ev.get('unit')} | {ev.get('averaging_period')} | {ev.get('reference_name')} | "
                f"`{ev.get('reference_type')}` | **{ev.get('evaluation_severity')}** |"
            )

        md.append("\n---\n")
        md.append("## Data Provenance & Methodology Notice")
        md.append("- All threshold evaluations reference verified international guidelines (WHO, US EPA, IPCC, World Bank) or EcoTrend project-defined criteria.")
        md.append("- *EcoTrend Compounding Environmental Risk Index* is a project-defined methodology classification.")

        return "\n".join(md)
