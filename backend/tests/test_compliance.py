import pytest
from app.core.compliance_rules import COMPLIANCE_RULES
from app.engine.compliance_engine import ComplianceEvaluationEngine
from app.engine.report_generator import EHSReportGenerator

def test_compliance_rules_metadata():
    for r_id, r in COMPLIANCE_RULES.items():
        assert "reference_type" in r
        assert r["reference_type"] in ["GUIDELINE", "POLICY_TARGET", "BENCHMARK", "PROJECT_DEFINED_METHODOLOGY"]
        assert "averaging_period" in r
        assert "source_url" in r
        assert "jurisdiction" in r

def test_evaluate_observation_compliant():
    # Observed PM2.5 12.0 ug/m3 <= 15.0 WHO 24h Guideline -> COMPLIANT
    ev = ComplianceEvaluationEngine.evaluate_observation("rule_air_pm25_24h", 12.0)
    assert ev["is_exceeded"] is False
    assert ev["status"] == "COMPLIANT"
    assert ev["evaluation_severity"] == "NORMAL"

def test_evaluate_observation_exceeded_warning():
    # Observed PM2.5 18.5 ug/m3 > 15.0 WHO 24h Guideline -> EXCEEDED_GUIDELINE
    ev = ComplianceEvaluationEngine.evaluate_observation("rule_air_pm25_24h", 18.5)
    assert ev["is_exceeded"] is True
    assert ev["status"] == "EXCEEDED_GUIDELINE"
    assert ev["evaluation_severity"] in ["WARNING", "CRITICAL"]

def test_compounding_risk_index():
    evals = [
        ComplianceEvaluationEngine.evaluate_observation("rule_air_pm25_24h", 25.0), # Exceeded Warning
        ComplianceEvaluationEngine.evaluate_observation("rule_water_do_hypoxia", 3.0), # Exceeded Critical
        ComplianceEvaluationEngine.evaluate_observation("rule_soil_pb_screening", 100.0) # Compliant
    ]
    res = ComplianceEvaluationEngine.calculate_compounding_risk_index(evals)

    assert res["compounding_risk_score"] > 0
    assert res["methodology_reference"] == "PROJECT_DEFINED_METHODOLOGY"
    assert "EcoTrend Compounding Environmental Risk Index" in res["attribution_notice"]

def test_ehs_report_generator():
    evals = [ComplianceEvaluationEngine.evaluate_observation("rule_air_pm25_24h", 18.5)]
    risk_summary = ComplianceEvaluationEngine.calculate_compounding_risk_index(evals)
    cepi_summary = {"cepi_score": 81, "category": "Good"}

    report_json = EHSReportGenerator.generate_json_report(
        "loc_us_ny_nyc_manhattan", "Manhattan Central Station", evals, risk_summary, cepi_summary
    )
    assert report_json["report_title"] == "EHS Standards & Guidelines Audit Report"
    assert "executive_summary" in report_json

    report_md = EHSReportGenerator.generate_markdown_report(
        "loc_us_ny_nyc_manhattan", "Manhattan Central Station", evals, risk_summary, cepi_summary
    )
    assert "# EHS Standards & Guidelines Audit Report" in report_md
    assert "`GUIDELINE`" in report_md
