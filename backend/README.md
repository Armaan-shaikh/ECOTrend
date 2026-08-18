# EcoTrend Backend Technical Specification & Architecture Manual

This document provides a technical specification for the EcoTrend backend architecture, environmental telemetry ingestion pipeline, multi-domain intelligence engine, decision automation framework, and governance controls.

---

## 1. System Objective

EcoTrend is an enterprise-grade Environmental Intelligence and Automated Decision Operations Platform. It provides regional environmental monitoring, predictive analytics, multi-domain risk evaluation, automated intervention prioritization, and durable workflow orchestration across 6 core domains:

1. **Air Quality:** Telemetry for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, and $\text{O}_3$.
2. **Water Quality:** Basin telemetry for Dissolved Oxygen (DO), pH, Turbidity, Electrical Conductivity, Nitrate, and Biological Oxygen Demand (BOD).
3. **Soil Contamination:** Topsoil metrics for Lead ($\text{Pb}$), Cadmium ($\text{Cd}$), Arsenic ($\text{As}$), Chromium ($\text{Cr}$), Mercury ($\text{Hg}$), pH, and Organic Carbon.
4. **Climate Drift:** Surface temperature anomaly ($\Delta^\circ\text{C}$), precipitation drift, extreme heat days, and drought severity index.
5. **GHG Emissions:** Scope 1 & 2 carbon intensity ($\text{tCO}_2\text{e}$), Methane ($\text{CH}_4$), Nitrous Oxide ($\text{N}_2\text{O}$), and Fluorinated gases.
6. **Noise Pollution:** Equivalent continuous sound level ($L_{\text{Aeq}}$ in $\text{dBA}$), day-night level ($L_{\text{dn}}$), peak noise ($L_{\text{max}}$), and night sound exposure ($L_{\text{night}}$).

### Key Technical Challenges Solved
- **Provenancing & Immutability:** Strict separation between `MEASURED` observations, `MODELED_ESTIMATE` data, `DERIVED` indices, `FORECASTED` projections, `SCENARIO` simulations, and `DECISION_SUPPORT` recommendations. Historical observations are immutable.
- **Outlier Cleaning & Signal Reconstruction:** Automated Interquartile Range ($\text{IQR}$) cleaning, z-score thresholding, linear/polynomial interpolation, and statistical anomaly detection.
- **Deterministic Multi-Domain Indexing:** Computation of domain-specific subscores and the Composite Environmental Performance Index ($\text{CEPI} \in [0, 100]$).
- **Event-Driven Resilience & Idempotency:** Duplicate suppression using SHA-256 event keys, dead-letter queue ($\text{DLQ}$) re-dispatch, and crash-resilient state recovery.
- **Advanced Security & SSRF Protection:** Zero-trust URL parsing with IP integer normalization (decimal, hex, octal), IPv6 loopback/private range detection, and DNS address resolution validation (`socket.getaddrinfo`).

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
└────────┬────────┘              └─────────┬────────┘              └─────────┬────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           │
   ┌───────────────────────────────────────┼───────────────────────────────────────┐
   │                                       │                                       │
┌──▼──────────────────┐         ┌──────────▼──────────┐                 ┌──────────▼──────────┐
│ Ingestion & Data    │         │ Analytics &         │                 │ Event Bus, Workflow │
│ Quality Pipeline    │         │ Multi-Domain Engine │                 │ & Webhook Engine    │
└─────────────────────┘         └─────────────────────┘                 └─────────────────────┘
```

### External & Internal Components

| Service / Tool | Type | Functional Role |
| :--- | :--- | :--- |
| **FastAPI (Python 3.14)** | Core Web Framework | Async REST API router, request validation via Pydantic V2, dependency injection. |
| **PostgreSQL 16 + TimescaleDB** | Database & Hypertables | Relational & time-series persistence, spatial queries via PostGIS, automated data hypertable chunking. |
| **Redis 7 (Alpine)** | Cache & Concurrency | API response caching, ingestion job concurrency locking (`ecotrend:lock:ingestion:<src>:<loc>`). |
| **OpenAQ v3 API** | Telemetry Source | Open-source public air quality data fetching and telemetry extraction. |
| **CPCB / CAAQMS Portals** | Telemetry Source | Open-source Indian regional environmental telemetry scraping and fallback simulation. |
| **Statsmodels / SciPy** | Analytical Engine | SARIMAX time-series forecasting, trend decomposition (STL/classical), anomaly z-score modeling. |
| **Passlib + PyJWT** | Authentication | PBKDF2 password hashing (290,000 iterations), HMAC SHA-256 JWT access token encoding/decoding. |
| **EventBus Engine** | Pub/Sub Engine | Typed domain event distribution (`INGESTION_COMPLETED`, `COMPLIANCE_ALERT_CREATED`, etc.) with idempotency checks. |
| **WebhookEngine** | Integration Engine | HMAC SHA-256 signed payload webhooks with 300s timestamp replay protection and advanced SSRF validation. |

---

## 3. Input Specification

The backend ingests structured request payloads across telemetry, operational, and administrative endpoints.

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
1. Request Reception & Auth ──► 2. Redis Cache Check ──► 3. Spatial & Telemetry Querying
                                                                   │
                                                                   ▼
6. Event Dispatch & Webhooks ◄── 5. Decision & Compliance ◄── 4. Multi-Domain CEPI Score
```

### Processing Pipeline

1. **Authentication & RBAC Filtering:**
   - `get_current_user` extracts and verifies the Bearer JWT token signature.
   - Raises `HTTP 401 Unauthorized` if token is missing/expired.
   - Enforces Role-Based Access Control (RBAC): `SUPER_ADMIN`, `ADMIN`, `ANALYST`, `OPERATOR`, `VIEWER`.

2. **Data Cleaning & Outlier Suppression (`backend/app/engine/cleaning.py`):**
   - Interquartile Range ($\text{IQR}$) calculation: $\text{IQR} = Q_3 - Q_1$.
   - Valid range boundaries: $[Q_1 - 1.5 \times \text{IQR}, Q_3 + 1.5 \times \text{IQR}]$.
   - Outliers flagged as `SUSPECT` or `INVALID` and recorded in `DataQualityLog`.

3. **Multi-Domain Indexing & CEPI Engine (`backend/app/engine/multi_domain_engine.py`):**
   - Normalizes metric values into subscores ($S_m \in [0, 100]$) using WHO/EPA/EU threshold curves.
   - Calculates domain scores ($S_{\text{domain}}$) and overall Composite Environmental Performance Index:
     $$\text{CEPI} = \sum_{d \in \text{Domains}} w_d \cdot S_d, \quad \text{where } \sum w_d = 1.0$$

4. **Dynamic Regulatory Compliance Engine (`backend/app/engine/compliance_engine.py`):**
   - Evaluates observations against WHO Air Standards (2021), EPA Eco-SSL Soil Standards, IPCC AR6 $+1.5^\circ\text{C}$ warming targets, and World Bank Carbon Footprint benchmarks.
   - Generates compliance violation alerts with severity tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

5. **Predictive Forecasting & Decision Engine (`backend/app/engine/predictive_engine.py` & `decision_engine.py`):**
   - Generates 30-day, 90-day, and 1-year SARIMAX time-series projections with 95% confidence intervals.
   - Constructs prioritized, evidence-chained recommendation items (`OBSERVATION` $\to$ `FORECAST` $\to$ `COMPLIANCE` $\to$ `PRIORITIZATION` $\to$ `RECOMMENDATION`).

6. **Event Bus Durability & SSRF-Hardened Webhook Engine (`backend/app/engine/webhook_engine.py`):**
   - Idempotent event distribution using `event_id` keys.
   - Webhook URL validation normalizes decimal integer IPs (`2130706433`), hex (`0x7f000001`), IPv6 loopback (`::1`), link-local (`fe80::/10`), unique local (`fc00::/7`), and checks DNS resolutions via `socket.getaddrinfo`.
   - Signs outgoing payloads using HMAC SHA-256 (`X-EcoTrend-Signature: t=<timestamp>,v1=<signature>`).

---

## 5. Output Specification

The backend produces structured JSON responses with explicit provenance metadata.

### Aggregate EHS Health Score Output (`GET /api/v1/health-score/current`)
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

### System Observability Overview Output (`GET /api/v1/observability/overview`)
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
