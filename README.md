# 🌿 EcoTrend — Environmental Intelligence & Multi-Domain Platform

[![Pytest Status](https://img.shields.io/badge/Pytest-142%2F142%20Passed-emerald)](https://github.com/Armaan-shaikh/ECOTrend)
[![Next.js Build](https://img.shields.io/badge/Next.js-14.2.4-cyan)](https://github.com/Armaan-shaikh/ECOTrend)
[![Docker Support](https://img.shields.io/badge/Docker-TimescaleDB%20%2B%20Redis-blue)](https://github.com/Armaan-shaikh/ECOTrend)
[![License](https://img.shields.io/badge/License-MIT-purple)](https://github.com/Armaan-shaikh/ECOTrend)

EcoTrend is an enterprise-grade Environmental Intelligence, Predictive Analytics, and Automated Decision Operations Platform. It monitors, forecasts, and automates environmental interventions across 6 core domains: **Air Quality**, **Water Quality**, **Soil Contamination**, **Climate Drift**, **GHG Emissions**, and **Noise Pollution**.

---

## 1. System Objective

EcoTrend provides real-time telemetry processing, statistical outlier cleaning, multi-domain compliance evaluation, automated intervention prioritization, and crash-resilient workflow orchestration for enterprise EHS (Environmental Health and Safety) operations.

### Core Problems Solved
- **Provenancing & Immutability:** Strict separation between `MEASURED` observations, `MODELED_ESTIMATE` data, `DERIVED` indices, `FORECASTED` projections, `SCENARIO` simulations, and `DECISION_SUPPORT` recommendations. Historical observations are immutable.
- **Outlier Cleaning & Signal Reconstruction:** Automated Interquartile Range ($\text{IQR}$) cleaning, z-score thresholding, linear/polynomial interpolation, and anomaly detection.
- **Composite Environmental Performance Index ($\text{CEPI}$):** Multi-domain weighted scoring engine ($0 - 100$) aligned with WHO (2021), EPA Eco-SSL, IPCC AR6, and World Bank standards.
- **Event-Driven Resilience & Idempotency:** Duplicate suppression via SHA-256 event keys, dead-letter queue ($\text{DLQ}$) re-dispatch, and crash-resilient state recovery.
- **Zero-Paid API Constraint & Indian City Telemetry:** Exclusive reliance on 100% free open-source endpoints (OpenAQ v3 API, CPCB CAAQMS portals) covering 59 major metropolitan cities across India.

---

## 2. Architecture & Integrations (Tools & APIs)

```
                       ┌─────────────────────────────────────────┐
                       │          FastAPI Gateway App            │
                       │             (/api/v1/)                  │
                       └───────────────────┬─────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────▼────────┐              ┌─────────▼────────┐              ┌─────────▼────────┐
│ PostgreSQL /    │              │  Redis Caching   │              │   In-Memory      │
│ TimescaleDB     │              │  & Lock Service  │              │   Cache Fallback │
│ (PostGIS)       │              │  (Port 6379)     │              │   (Degraded)     │
└────────┬────────┘              └────────┬────────┘              └────────┬────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           │
   ┌───────────────────────────────────────┼───────────────────────────────────────┐
   │                                       │                                       │
┌──▼──────────────────┐         ┌──────────▼──────────┐                 ┌──────────▼──────────┐
│ Ingestion & Data    │         │ Analytics &         │                 │ Event Bus, Workflow │
│ Quality Pipeline    │         │ Multi-Domain Engine │                 │ & Webhook Engine    │
└─────────────────────┘         └─────────────────────┘└─────────────────────┘
```

### Technical Stack & Dependencies

| Layer / Tool | Technology | Functional Role |
| :--- | :--- | :--- |
| **Backend Core** | FastAPI (Python 3.14) | Async REST API router, request validation via Pydantic V2, OpenAPI specs. |
| **Frontend UI** | Next.js 14 + Tailwind CSS | Centralized Search Landing Page, 59 Indian Cities workflow, domain dashboards. |
| **Database** | PostgreSQL 16 + TimescaleDB | Hypertables, PostGIS spatial queries, automated time-series chunking. |
| **Caching & Lock** | Redis 7 (Alpine) | API response caching, ingestion job concurrency locking (`ecotrend:lock:ingestion:<src>:<loc>`). |
| **Open Data APIs** | OpenAQ v3 API & CPCB CAAQMS | Free open-source air quality telemetry and regional environmental telemetry. |
| **Statistical Engine** | Statsmodels / SciPy | SARIMAX time-series forecasting, trend decomposition, anomaly z-score modeling. |
| **Security & Auth** | Passlib (PBKDF2) + PyJWT | 290,000 PBKDF2 iterations, HMAC SHA-256 JWT access tokens, server-side RBAC. |
| **Integrations** | WebhookEngine | HMAC SHA-256 signed webhooks, 300s replay protection, advanced SSRF validation. |

---

## 3. Input Specification

### Authentication & Authorization Header
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-Tenant-ID: tenant_ecotrend_enterprise
```

### Telemetry Measurement Ingestion Payload (`POST /api/v1/air/measurements`)
```json
{
  "location_id": "loc_in_delhi_cpcb_01",
  "domain": "AIR",
  "metric": "PM2.5",
  "value": 148.5,
  "unit": "µg/m³",
  "timestamp": "2026-08-18T16:00:00Z",
  "source": "OpenAQ v3",
  "data_quality": "VALID",
  "raw_value": 148.5,
  "provenance": "MEASURED"
}
```

### Intervention Approval Request Payload (`POST /api/v1/approvals`)
```json
{
  "intervention_id": "int_air_dust_suppression_01",
  "title": "Industrial Dust Suppression & Mist Cannon Deployment",
  "domain": "AIR",
  "estimated_cepi_improvement": 4.2,
  "reason": "PM2.5 exceeded WHO 24h threshold (148.5 µg/m³ > 15.0 µg/m³)"
}
```

### Webhook Target Registration Payload (`POST /api/v1/operations/webhooks`)
```json
{
  "target_url": "https://hooks.enterprise-ehs.org/ecotrend/alerts",
  "secret": "whsec_prod_secret_key_88491",
  "subscribed_events": ["COMPLIANCE_ALERT_CREATED", "WORKFLOW_FAILED"]
}
```

---

## 4. Analysis & Core Processing Logic

```
1. Request Reception & Auth ──► 2. Redis Cache Check ──► 3. Telemetry Processing & Data Cleaning
                                                                   │
                                                                   ▼
6. Event Dispatch & Webhooks ◄── 5. Decision & Compliance ◄── 4. Multi-Domain CEPI Score
```

### Execution Steps

1. **Authentication & RBAC Scope Validation:**
   - Decodes JWT token and enforces Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `ANALYST`, `OPERATOR`, `VIEWER`).
   - Cross-tenant access attempts raise `PermissionError` / HTTP 403 Forbidden.

2. **Data Cleaning & Outlier Suppression (`backend/app/engine/cleaning.py`):**
   - Calculates Interquartile Range ($\text{IQR} = Q_3 - Q_1$).
   - Rejects or flags observations outside $[Q_1 - 1.5 \times \text{IQR}, Q_3 + 1.5 \times \text{IQR}]$ in `DataQualityLog`.

3. **Composite Environmental Performance Index ($\text{CEPI}$ Engine):**
   - Normalizes metric values into subscores ($S_m \in [0, 100]$).
   - Computes weighted overall CEPI:
     $$\text{CEPI} = \sum_{d \in \text{Domains}} w_d \cdot S_d, \quad \text{where } \sum w_d = 1.0$$

4. **Dynamic Regulatory Compliance Engine (`backend/app/engine/compliance_engine.py`):**
   - Evaluates observations against WHO (2021), EPA Eco-SSL, IPCC AR6, and World Bank criteria.
   - Triggers severity alerts (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

5. **Predictive AI & Decision Automation (`backend/app/engine/decision_engine.py`):**
   - Generates 30-day, 90-day, and 1-year SARIMAX forecasts with 95% confidence intervals.
   - Constructs prioritized recommendation evidence chains (`OBSERVATION` $\to$ `FORECAST` $\to$ `COMPLIANCE` $\to$ `PRIORITIZATION` $\to$ `RECOMMENDATION`).

6. **Durable Webhook Engine & Advanced SSRF Hardening (`backend/app/engine/webhook_engine.py`):**
   - Normalizes IP integer encodings (decimal `2130706433`, hex `0x7f000001`), IPv6 loopback (`::1`), link-local (`fe80::/10`), unique local (`fc00::/7`), and validates DNS resolutions via `socket.getaddrinfo`.
   - Dispatches HMAC SHA-256 signed payloads with 300s timestamp replay protection.

---

## 5. Output Specification

### Aggregate EHS Health Score Response (`GET /api/v1/health-score/current`)
```json
{
  "overall_ehs": 64.2,
  "category": "MODERATE",
  "color": "#F59E0B",
  "health_impact": "Air quality and river basin DO show moderate degradation.",
  "data_coverage_percent": 98.4,
  "primary_pollutant_driver": "PM2.5",
  "explanation": "Calculated via EcoTrend CEPI Multi-Domain Engine.",
  "metric_subscores": [
    {
      "metric": "PM2.5",
      "value": 42.1,
      "unit": "µg/m³",
      "score": 58.0,
      "category": "MODERATE",
      "standard": "WHO 24h Guideline (15.0 µg/m³)",
      "weight": 0.25,
      "is_available": true,
      "contribution_pct": 25.0
    }
  ],
  "provenance": "DERIVED"
}
```

### System Observability Overview Response (`GET /api/v1/observability/overview`)
```json
{
  "system_health": "HEALTHY",
  "infrastructure_health": {
    "database": "ok",
    "redis": "ok",
    "event_bus": "ok"
  },
  "sources_summary": {
    "total_sources": 6,
    "healthy_sources": 6,
    "degraded_sources": 0
  },
  "active_alerts_count": 1,
  "event_processing_latency_ms": 12.4,
  "dead_letter_count": 0,
  "duplicate_suppression_count": 4,
  "webhook_success_rate_percent": 100.0,
  "provenance": "DERIVED"
}
```

---

## 6. Indian Cities Coverage (59 Metropolitan Cities)

EcoTrend features a Centralized Search Landing Page covering 59 major metropolitan cities across India:

- **North (26):** New Delhi, Noida, Gurgaon, Ghaziabad, Faridabad, Chandigarh, Lucknow, Kanpur, Agra, Varanasi, Prayagraj, Meerut, Bareilly, Moradabad, Aligarh, Gorakhpur, Ludhiana, Amritsar, Jalandhar, Jammu, Srinagar, Dehradun, Shimla, Jaipur, Jodhpur, Kota.
- **South (16):** Bengaluru, Mysuru, Hubballi-Dharwad, Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Hyderabad, Warangal, Visakhapatnam, Vijayawada, Guntur, Kochi, Thiruvananthapuram, Kozhikode.
- **West (11):** Mumbai, Pune, Nagpur, Nashik, Thane, Chhatrapati Sambhajinagar, Solapur, Ahmedabad, Surat, Vadodara, Rajkot.
- **East & Central (16):** Kolkata, Howrah, Asansol, Siliguri, Patna, Ranchi, Dhanbad, Jamshedpur, Bhubaneswar, Cuttack, Raipur, Bhopal, Indore, Gwalior, Jabalpur, Guwahati.

---

## 7. Running & Testing Locally

### Start Backend FastAPI Server
```bash
set PYTHONPATH=backend
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Liveness Probe: `http://localhost:8000/api/v1/health/liveness`

### Start Frontend Next.js Dev Server
```bash
cd frontend
npm run dev
```
- Web Dashboard: `http://localhost:3000`

### Run Backend Pytest Test Suite (142/142 Passed)
```bash
set PYTHONPATH=backend
py -m pytest backend/tests/
```
