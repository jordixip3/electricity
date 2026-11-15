# SMART GRID ELECTRICITY MANAGEMENT & BESS AUTOMATION SYSTEM (EMS-BESS)
**System Engineering Specifications, Functional Architecture, Technical Requirements, and Operational Scope**

---

### Document Control & Engineering Metadata
* **Document Reference:** ENG-SPEC-2026-ELE-001
* **Author / Role:** Lead Power Systems & Field Automation Engineer (Electricidad Industrial Grid Solutions)
* **Date of Issue:** August 2026
* **System Architecture:** Java 17 / Spring Boot 3.x | Oracle Database 21c | React 18 TypeScript | Docker Multi-Tier Subnets
* **Approval Status:** APPROVED FOR FIELD IMPLEMENTATION & SUBSTATION COMMISSIONING

---

## 1. Executive Summary & Field Engineering Mandate

This document establishes the comprehensive engineering specifications, system architecture, functional capabilities, technical constraints, and boundary scope for the **Smart Grid Electricity Management and Battery Energy Storage Automation System (EMS-BESS)**. 

Developed from an on-site field electrical engineer's perspective, this solution bridges high-voltage/medium-voltage (MV/LV) substation telemetry, industrial battery energy storage banks (BESS), programmable logic controllers (PLCs), digital smart meters, and enterprise customer billing infrastructure into a unified SCADA-EMS platform.

> **FIELD COMMAND PRINCIPLE:**
> Modern power distribution networks demand deterministic real-time observability, high-availability telemetry ingestion, and automated peak shaving to prevent transformer thermal overload. Furthermore, zero-trust network isolation is mandatory to protect mission-critical relational database assets (Oracle DB) against cyber-physical intrusion vectors.

---

## 2. Project Scope & Field Boundary Conditions

To ensure operational clarity and prevent scope creep during substation commissioning, the boundary conditions of the Electricity Management System are explicitly defined below:

### 2.1 In-Scope Substation & Field Infrastructure
* **MV/LV Distribution Network Monitoring:** Medium Voltage (MV) to Low Voltage (LV) Transformer Nodes. Integration of digital metering transformers, connection point monitoring (`PuntoConexion`), line voltage (kV), phase current (A), and power factor.
* **Smart Metering Fleet (AMI):** Bi-directional telemetry capture from static digital energy meters (`Medidor` / `Lectura`), including active energy (kWh), reactive energy (kVARh), voltage sag/swell detection, and 15-minute load profile intervals.
* **Industrial Energy Storage (BESS):** Automated supervisory control of utility-scale Lithium-Ion / LFP battery storage banks (`Bateria`). Enforces State of Charge (SoC), State of Health (SoH), charge/discharge C-rates, thermal monitoring, and automated peak shaving during peak tariff hours.
* **Field PLC & SCADA Automation:** Integration with substation automation PLCs (Siemens S7-1200 / Schneider Modicon via Modbus TCP/RTU) for automated circuit breaker trips, islanding isolation, and emergency fault clearing.
* **Customer Billing & Outage Management:** Full tariff administration, customer account mapping (`Cliente`), consumption aggregation, automated invoice generation, and incident ticket lifecycle management (`Incidencia`).
* **Cybersecurity & Containerization:** Containerized multi-tier Docker architecture with strict two-tier subnetwork isolation (`frontend-net`, `backend-net`) enforcing complete database invisibility from public networks.

### 2.2 Out-of-Scope Boundary Limits
* **HV Transmission Grid (> 110 kV):** Physical transmission lines exceeding 110 kV utility transmission thresholds.
* **Civil Infrastructure Construction:** Civil site construction, concrete transformer pad pours, and physical fence security installations.
* **Customer Building Internal Wiring:** Internal customer household wiring beyond the service entrance breaker and digital meter connection terminals.

---

## 3. Functional Architecture & System Capabilities

The EMS-BESS framework delivers five core functional modules engineered to ensure grid resilience, automated load balancing, and accurate financial settlement:

### 3.1 Telemetry & High-Frequency Ingestion Module
The system ingests high-frequency telemetry data streamed from field meters and PLCs. Each telemetry packet (`Lectura`) captures active power (kW), total energy (kWh), voltage (V), current (A), and power factor across phase lines.
* **Sampling Frequency:** Configurable sub-second polling for critical substation nodes; 15-minute scheduled intervals for residential/commercial smart meters.
* **Data Integrity Validation:** Automatic validation of voltage ranges (230V ± 10% nominal LV; 11kV/20kV MV) and rejection of corrupted Modbus frames.

### 3.2 BESS & Peak Shaving Automation Module
Industrial battery energy storage systems (BESS) are dynamically controlled via the Battery Service module. The system evaluates grid load against peak tariff thresholds to execute automated charge and discharge cycles.
* **Automated Peak Shaving:** When substation transformer load exceeds 85% rated capacity, BESS automatically discharges up to nominal C-rate to shave peak demand.
* **SoC Guardrails:** Restricts Depth of Discharge (DoD) between 20% minimum SoC and 95% maximum SoC to maximize battery lifecycle (SoH > 80% over 10 years).
* **Thermal Safety Shutdown:** Continuous thermal and cell balance monitoring with immediate trip signal on cell temperature exceeding 45°C.

### 3.3 Field PLC & Breaker Control Module
Programmable Logic Controllers (PLCs) govern physical breaker states, transformer tap changers, and capacitor bank switching. The PLC service provides secure REST endpoints mapped to Modbus registers.

### 3.4 Alarm, Incident Triage & Outage Management
Grid anomalies automatically generate Incident records (`Incidencia`) categorized by severity (CRITICAL, MAJOR, MINOR). Critical alerts trigger real-time HMI visual warnings and dispatch notifications for field maintenance crews.

### 3.5 Customer Billing & Multi-Tariff Engine
Aggregates time-series consumption data across billing periods, applying dynamic multi-hourly tariffs (Peak, Off-Peak, Valley). Generates detailed customer statements and exports financial reports.

---

## 4. Technical Requirements & Cybersecurity Architecture

The technical architecture is built on enterprise-grade software standards, ensuring deterministic reliability and strict compliance with NERC CIP / IEC 62443 industrial cybersecurity standards.

### 4.1 Technology Stack Specifications

| Layer / Component | Technology / Framework | Engineering Justification & Role |
| :--- | :--- | :--- |
| **Backend REST API** | Java 17, Spring Boot 3.x, Spring JPA | High-concurrency micro-service handling telemetry processing, business logic, and security authentication. |
| **Relational Persistence** | Oracle Database 19c/21c Enterprise | ACID-compliant storage for time-series readings, client accounts, BESS status, and relational audit records. |
| **Frontend HMI** | React 18, TypeScript, Vite, Tailwind CSS | Operator visual dashboard providing sub-second HMI updates, BESS state meters, interactive grid topology, and incident triage. |
| **Reverse Proxy & Web Server** | Nginx (Alpine Docker) | Handles TLS termination, static asset delivery, and secure proxying of `/api/*` requests to the Spring backend. |
| **Container Orchestration** | Docker & Docker Compose | Provides isolated micro-container deployment with deterministic network segmentation and health checks. |

### 4.2 Cybersecurity & Subnetwork Segmentation Architecture
To prevent cyber-physical attacks against power grid assets, the system implements a strict multi-tier network topology using Docker isolated subnets:

1. **Subnetwork 1 — `frontend-net`:** The public-facing network hosting the Nginx Frontend container (port `8181`) and the Spring Boot Backend container. Allows operator browser access to the HMI.
2. **Subnetwork 2 — `backend-net`:** A completely isolated private network connecting the Spring Boot Backend with the Oracle Database container (port `1521`). The Frontend container is physically detached from `backend-net`.
3. **Zero Host Port Exposure:** The `oracle-db` container explicitly omits public port exposure in `docker-compose.yml`. Port 1521 is inaccessible from the host machine or public internet.
4. **Dual-Homed Security Gateway:** The Spring Boot Backend acts as a secure dual-homed proxy bridge between the two networks, validating JWT tokens and sanitizing SQL queries via JPA object relational mapping.

> **CYBERSECURITY FIELD AUDIT RESULT:**
> Substation Firewall Verification Protocol: Running `nc -zv localhost 1521` from the Docker host yields 'Connection Refused', confirming complete port isolation. Direct connection attempts from the frontend container to `oracle-db` fail with 'Host Unreachable'. Access is granted exclusively to the Spring Boot backend service.

### 4.3 Performance KPIs & Service Level Objectives
* **HMI Telemetry Latency:** System latency for HMI dashboard telemetry updates must not exceed 200 ms under nominal operational load.
* **Ingestion Throughput:** The backend API ingestion pipeline must sustain at least 1,000 telemetry readings per second per node cluster.
* **System Availability:** 99.95% annual availability for the core backend telemetry and BESS control services.
* **Data Retention:** 5-year online time-series retention in Oracle DB for compliance auditing and forensic analysis.

---

## 5. Operational Field Safety, Fallback & Maintenance Standards

Field operations in electrical substations require strict adherence to international electrical safety codes and fail-safe automated behaviors:

### 5.1 Electrical Safety & Regulatory Compliance
* **IEEE 519 Standard:** Harmonic control compliance for non-linear inverter loads (BESS solar/wind interconnections).
* **IEC 61850 / IEC 60870-5-104:** Communication networks and system architecture for substation automation.
* **NFPA 70E / NEC Code:** Standard for electrical safety in client workplaces and high-voltage substation yards.

### 5.2 Fail-Safe Operating & Emergency Protocols
* **Autonomous Local PLC Fallback:** In the event of total network or backend disconnection, field PLCs automatically revert to autonomous local control mode based on hardwired voltage/frequency sensors.
* **Hardwired Thermal Battery Cutoff:** High-temperature thermal sensors on BESS units initiate hardwired contactor trips independent of software application state.
* **Audit Trail & Event Logging:** All control actions (breaker operations, BESS parameter overrides, manual trip signals) are recorded in tamper-evident Oracle DB audit tables with operator ID and millisecond timestamp.
