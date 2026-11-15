import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# --- DATA STRUCTURE FOR DOCUMENT CONTENT ---

DOC_TITLE = "SMART GRID ELECTRICITY MANAGEMENT & BESS AUTOMATION SYSTEM"
DOC_SUBTITLE = "System Engineering Specifications, Functional Architecture, Technical Requirements, and Operational Scope"
DOC_REF = "REF: ENG-SPEC-2026-ELE-001"
AUTHOR = "Lead Power Systems & Field Automation Engineer"
DATE_STR = "August 2026"
ORG = "Electricidad Industrial Grid Solutions"

# Color Palette
NAVY_HEX = "1B365D"
STEEL_HEX = "4A777A"
CHARCOAL_HEX = "2D3748"
LIGHT_BG_HEX = "F0F4F8"
BORDER_HEX = "CBD5E0"

NAVY_RGB = RGBColor(0x1B, 0x36, 0x5D)
STEEL_RGB = RGBColor(0x4A, 0x77, 0x7A)
CHARCOAL_RGB = RGBColor(0x2D, 0x37, 0x48)

RL_NAVY = colors.HexColor("#1B365D")
RL_STEEL = colors.HexColor("#4A777A")
RL_CHARCOAL = colors.HexColor("#2D3748")
RL_LIGHT_BG = colors.HexColor("#F0F4F8")
RL_BORDER = colors.HexColor("#CBD5E0")
RL_ACCENT = colors.HexColor("#2B6CB0")


def set_cell_background(cell, hex_color):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_callout_box_docx(doc, text, title="FIELD ENGINEER NOTE:"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, LIGHT_BG_HEX)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border only
    borders_xml = f'''
    <w:tcBorders {nsdecls("w")}>
        <w:top w:val="none"/>
        <w:left w:val="single" w:sz="36" w:space="0" w:color="{NAVY_HEX}"/>
        <w:bottom w:val="none"/>
        <w:right w:val="none"/>
    </w:tcBorders>
    '''
    cell._tc.get_or_add_tcPr().append(parse_xml(borders_xml))
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(f"{title} ")
    run_t.bold = True
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(10.5)
    run_t.font.color.rgb = NAVY_RGB
    
    run_b = p.add_run(text)
    run_b.font.name = "Calibri"
    run_b.font.size = Pt(10)
    run_b.font.color.rgb = CHARCOAL_RGB
    
    # Empty spacing paragraph after table
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)


# --- BUILD WORD DOCUMENT ---

def generate_word_document(filename):
    doc = docx.Document()
    
    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
        # Header / Footer setup
        footer = section.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run(f"{DOC_REF} | {ORG} — Confidential Field Specification")
        f_run.font.name = "Calibri"
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = RGBColor(0x71, 0x80, 0x96)

    # Document Header / Title Block
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(DOC_TITLE)
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY_RGB

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run(DOC_SUBTITLE)
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = STEEL_RGB

    # Document Control Metadata Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Document Reference:", DOC_REF),
        ("Author / Role:", f"{AUTHOR} ({ORG})"),
        ("System Architecture:", "Spring Boot 3.x | Oracle DB 21c | React TypeScript | Docker Isolated Networks"),
        ("Approval Status:", "APPROVED FOR FIELD IMPLEMENTATION & SUBSTATION COMMISSIONING")
    ]
    for row_idx, (label, val) in enumerate(meta_data):
        cell_lbl = meta_table.cell(row_idx, 0)
        cell_val = meta_table.cell(row_idx, 1)
        cell_lbl.width = Inches(2.2)
        cell_val.width = Inches(4.3)
        set_cell_background(cell_lbl, LIGHT_BG_HEX)
        set_cell_margins(cell_lbl, 60, 60, 100, 100)
        set_cell_margins(cell_val, 60, 60, 100, 100)
        
        p_l = cell_lbl.paragraphs[0]
        r_l = p_l.add_run(label)
        r_l.bold = True
        r_l.font.name = "Calibri"
        r_l.font.size = Pt(9.5)
        r_l.font.color.rgb = NAVY_RGB
        
        p_v = cell_val.paragraphs[0]
        r_v = p_v.add_run(val)
        r_v.font.name = "Calibri"
        r_v.font.size = Pt(9.5)
        r_v.font.color.rgb = CHARCOAL_RGB
        
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = NAVY_RGB
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(12.5)
        r.font.bold = True
        r.font.color.rgb = STEEL_RGB
        return p

    def add_body(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = "Calibri"
            r_pre.font.size = Pt(10.5)
            r_pre.font.color.rgb = CHARCOAL_RGB
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = CHARCOAL_RGB
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = "Calibri"
            r_pre.font.size = Pt(10)
            r_pre.font.color.rgb = NAVY_RGB
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = CHARCOAL_RGB
        return p

    # --- SECTION 1 ---
    add_h1("1. Executive Summary & Field Engineering Mandate")
    add_body("This document establishes the comprehensive engineering specifications, system architecture, functional capabilities, technical constraints, and boundary scope for the Smart Grid Electricity Management and Battery Energy Storage Automation System (EMS-BESS). Developed from an on-site field electrical engineer's perspective, this solution bridges high-voltage/medium-voltage (MV/LV) substation telemetry, industrial battery energy storage banks, programmable logic controllers (PLCs), digital smart meters, and enterprise customer billing infrastructure into a unified SCADA-EMS platform.")
    
    add_callout_box_docx(
        doc,
        "Modern power distribution networks demand deterministic real-time observability, high-availability telemetry ingestion, and automated peak shaving to prevent transformer thermal overload. Furthermore, zero-trust network isolation is mandatory to protect mission-critical relational database assets (Oracle DB) against cyber-physical intrusion vectors.",
        "FIELD COMMAND PRINCIPLE:"
    )

    # --- SECTION 2 ---
    add_h1("2. Project Scope & Field Boundary Conditions")
    add_body("To ensure operational clarity and prevent scope creep during substation commissioning, the boundary conditions of the Electricity Management System are explicitly defined below:")
    
    add_h2("2.1 In-Scope Substation & Field Infrastructure")
    add_bullet(" High-Voltage (HV) to Medium-Voltage (MV) & MV/LV Transformer Nodes: Integration of digital metering transformers, connection point monitoring (PuntoConexion), line voltage (kV), phase current (A), and power factor.", "MV/LV Distribution Network Monitoring:")
    add_bullet(" Bi-directional telemetry capture from static digital energy meters (Medidor / Lectura), including active energy (kWh), reactive energy (kVARh), voltage sag/swell detection, and 15-minute load profile intervals.", "Smart Metering Fleet (AMI):")
    add_bullet(" Automated supervisory control of utility-scale Lithium-Ion / LFP battery storage banks (Bateria). Enforces State of Charge (SoC), State of Health (SoH), charge/discharge C-rates, thermal monitoring, and automated peak shaving during peak tariff hours.", "Industrial Energy Storage (BESS):")
    add_bullet(" Integration with substation automation PLCs (Siemens S7-1200 / Schneider Modicon via Modbus TCP/RTU) for automated circuit breaker trips, islanding isolation, and emergency fault clearing.", "Field PLC & SCADA Automation:")
    add_bullet(" Full tariff administration, customer account mapping (Cliente), consumption aggregation, automated invoice generation, and incident ticket lifecycle management (Incidencia).", "Customer Billing & Outage Management:")
    add_bullet(" Containerized multi-tier Docker architecture with strict two-tier subnetwork isolation (frontend-net, backend-net) enforcing complete database invisibility from public networks.", "Cybersecurity & Containerization:")

    add_h2("2.2 Out-of-Scope Boundary Limits")
    add_bullet(" Physical transmission lines exceeding 110 kV utility transmission thresholds.", "HV Transmission Grid (> 110 kV):")
    add_bullet(" Civil site construction, concrete transformer pad pours, and physical fence security installations.", "Civil Infrastructure Construction:")
    add_bullet(" Internal customer household wiring beyond the service entrance breaker and digital meter connection terminals.", "Customer Building Internal Wiring:")

    # --- SECTION 3 ---
    add_h1("3. Functional Architecture & System Capabilities")
    add_body("The EMS-BESS framework delivers five core functional modules engineered to ensure grid resilience, automated load balancing, and accurate financial settlement:")

    add_h2("3.1 Telemetry & High-Frequency Ingestion Module")
    add_body("The system ingests high-frequency telemetry data streamed from field meters and PLCs. Each telemetry packet (Lectura) captures active power (kW), total energy (kWh), voltage (V), current (A), and power factor across phase lines.")
    add_bullet("Configurable sub-second polling for critical substation nodes; 15-minute scheduled intervals for residential/commercial smart meters.", "Sampling Frequency:")
    add_bullet("Automatic validation of voltage ranges (230V ± 10% nominal LV; 11kV/20kV MV) and rejection of corrupted Modbus frames.", "Data Integrity Validation:")

    add_h2("3.2 BESS & Peak Shaving Automation Module")
    add_body("Industrial battery energy storage systems (BESS) are dynamically controlled via the Battery Service module. The system evaluates grid load against peak tariff thresholds to execute automated charge and discharge cycles.")
    add_bullet("When substation transformer load exceeds 85% rated capacity, BESS automatically discharges up to nominal C-rate to shave peak demand.", "Automated Peak Shaving:")
    add_bullet("Restricts Depth of Discharge (DoD) between 20% minimum SoC and 95% maximum SoC to maximize battery lifecycle (SoH > 80% over 10 years).", "SoC Guardrails:")
    add_bullet("Continuous thermal and cell balance monitoring with immediate trip signal on cell temperature exceeding 45°C.", "Thermal Safety Shutdown:")

    add_h2("3.3 Field PLC & Breaker Control Module")
    add_body("Programmable Logic Controllers (PLCs) govern physical breaker states, transformer tap changers, and capacitor bank switching. The PLC service provides secure REST endpoints mapped to Modbus registers.")

    add_h2("3.4 Alarm, Incident Triage & Outage Management")
    add_body("Grid anomalies automatically generate Incident records (Incidencia) categorized by severity (CRITICAL, MAJOR, MINOR). Critical alerts trigger real-time HMI visual warnings and dispatch notifications for field maintenance crews.")

    add_h2("3.5 Customer Billing & Multi-Tariff Engine")
    add_body("Aggregates time-series consumption data across billing periods, applying dynamic multi-hourly tariffs (Peak, Off-Peak, Valley). Generates detailed customer statements and exports financial reports.")

    # --- SECTION 4 ---
    add_h1("4. Technical Requirements & Cybersecurity Architecture")
    add_body("The technical architecture is built on enterprise-grade software standards, ensuring deterministic reliability and strict compliance with NERC CIP / IEC 62443 industrial cybersecurity standards.")

    add_h2("4.1 Technology Stack Specifications")
    
    # Table of Tech Stack
    tech_table = doc.add_table(rows=6, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Layer / Component", "Technology / Framework", "Engineering Justification & Role"]
    for i, h in enumerate(headers):
        c = tech_table.cell(0, i)
        set_cell_background(c, NAVY_HEX)
        set_cell_margins(c, 80, 80, 100, 100)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    tech_rows = [
        ("Backend REST API", "Java 17, Spring Boot 3.x, Spring JPA", "High-concurrency micro-service handling telemetry processing, business logic, and security authentication."),
        ("Relational Persistence", "Oracle Database 19c/21c Enterprise", "ACID-compliant storage for time-series readings, client accounts, BESS status, and relational audit records."),
        ("Frontend HMI", "React 18, TypeScript, Vite, Tailwind CSS", "Operator visual dashboard providing sub-second HMI updates, BESS state meters, interactive grid topology, and incident triage."),
        ("Reverse Proxy & Web Server", "Nginx (Alpine Docker)", "Handles TLS termination, static asset delivery, and secure proxying of /api/* requests to the Spring backend."),
        ("Container Orchestration", "Docker & Docker Compose", "Provides isolated micro-container deployment with deterministic network segmentation and health checks.")
    ]

    for row_idx, data in enumerate(tech_rows, start=1):
        for col_idx, text in enumerate(data):
            c = tech_table.cell(row_idx, col_idx)
            if row_idx % 2 == 1:
                set_cell_background(c, "F7FAFC")
            else:
                set_cell_background(c, "FFFFFF")
            set_cell_margins(c, 60, 60, 80, 80)
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.name = "Calibri"
            r.font.size = Pt(9)
            r.font.color.rgb = CHARCOAL_RGB

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("4.2 Cybersecurity & Subnetwork Segmentation Architecture")
    add_body("To prevent cyber-physical attacks against power grid assets, the system implements a strict multi-tier network topology using Docker isolated subnets:")
    
    add_bullet("The public-facing network hosting the Nginx Frontend container (port 8181) and the Spring Boot Backend container. Allows operator browser access to the HMI.", "Subnetwork 1 — frontend-net:")
    add_bullet("A completely isolated private network connecting the Spring Boot Backend with the Oracle Database container (port 1521). The Frontend container is physically detached from backend-net.", "Subnetwork 2 — backend-net:")
    add_bullet("The oracle-db container explicitly omits public port exposure in docker-compose.yml. Port 1521 is inaccessible from the host machine or public internet.", "Zero Host Port Exposure:")
    add_bullet("The Spring Boot Backend acts as a secure dual-homed proxy bridge between the two networks, validating JWT tokens and sanitizing SQL queries via JPA object relational mapping.", "Dual-Homed Security Gateway:")

    add_callout_box_docx(
        doc,
        "Substation Firewall Verification Protocol: Running `nc -zv localhost 1521` from the Docker host yields 'Connection Refused', confirming complete port isolation. Direct connection attempts from the frontend container to `oracle-db` fail with 'Host Unreachable'. Access is granted exclusively to the Spring Boot backend service.",
        "CYBERSECURITY FIELD AUDIT RESULT:"
    )

    add_h2("4.3 Performance KPIs & Service Level Objectives")
    add_bullet("System latency for HMI dashboard telemetry updates must not exceed 200 ms under nominal operational load.", "HMI Telemetry Latency:")
    add_bullet("The backend API ingestion pipeline must sustain at least 1,000 telemetry readings per second per node cluster.", "Ingestion Throughput:")
    add_bullet("99.95% annual availability for the core backend telemetry and BESS control services.", "System Availability:")
    add_bullet("5-year online time-series retention in Oracle DB for compliance auditing and forensic analysis.", "Data Retention:")

    # --- SECTION 5 ---
    add_h1("5. Operational Field Safety, Fallback & Maintenance Standards")
    add_body("Field operations in electrical substations require strict adherence to international electrical safety codes and fail-safe automated behaviors:")

    add_h2("5.1 Electrical Safety & Regulatory Compliance")
    add_bullet("Harmonic control compliance for non-linear inverter loads (BESS solar/wind interconnections).", "IEEE 519 Standard:")
    add_bullet("Communication networks and system architecture for substation automation.", "IEC 61850 / IEC 60870-5-104:")
    add_bullet("Standard for electrical safety in client workplaces and high-voltage substation yards.", "NFPA 70E / NEC Code:")

    add_h2("5.2 Fail-Safe Operating & Emergency Protocols")
    add_bullet("In the event of total network or backend disconnection, field PLCs automatically revert to autonomous local control mode based on hardwired voltage/frequency sensors.", "Autonomous Local PLC Fallback:")
    add_bullet("High-temperature thermal sensors on BESS units initiate hardwired contactor trips independent of software application state.", "Hardwired Thermal Battery Cutoff:")
    add_bullet("All control actions (breaker operations, BESS parameter overrides, manual trip signals) are recorded in tamper-evident Oracle DB audit tables with operator ID and millisecond timestamp.", "Audit Trail & Event Logging:")

    # Save document
    doc.save(filename)
    print(f"Word document successfully created at: {filename}")


# --- BUILD REPORTLAB PDF DOCUMENT ---

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Suppress on page 1 title if desired, but here we include running header/footer
        # Running Header
        self.drawString(54, 750, f"{DOC_TITLE}")
        self.drawRightString(612 - 54, 750, f"{DOC_REF}")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 742, 612 - 54, 742)
        
        # Running Footer
        self.line(54, 48, 612 - 54, 48)
        self.drawString(54, 36, f"Confidential — {ORG} Engineering Field Specification")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        
        self.restoreState()


def generate_pdf_document(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=RL_NAVY,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=RL_STEEL,
        spaceAfter=14
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=RL_NAVY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=RL_STEEL,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=RL_CHARCOAL,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=RL_CHARCOAL,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=RL_NAVY
    )
    
    meta_val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=RL_CHARCOAL
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=RL_CHARCOAL
    )

    tbl_header_style = ParagraphStyle(
        'TblHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    tbl_cell_style = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=RL_CHARCOAL
    )

    story = []

    # Title & Header Block
    story.append(Paragraph(DOC_TITLE, title_style))
    story.append(Paragraph(DOC_SUBTITLE, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=RL_NAVY, spaceAfter=10))

    # Metadata Table
    meta_rows = [
        [Paragraph("Document Reference:", meta_label_style), Paragraph(DOC_REF, meta_val_style)],
        [Paragraph("Author / Role:", meta_label_style), Paragraph(f"{AUTHOR} ({ORG})", meta_val_style)],
        [Paragraph("System Architecture:", meta_label_style), Paragraph("Spring Boot 3.x | Oracle DB 21c | React TypeScript | Docker Isolated Networks", meta_val_style)],
        [Paragraph("Approval Status:", meta_label_style), Paragraph("APPROVED FOR FIELD IMPLEMENTATION & SUBSTATION COMMISSIONING", meta_val_style)]
    ]
    meta_table = Table(meta_rows, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), RL_LIGHT_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, RL_BORDER),
        ('BOX', (0, 0), (-1, -1), 0.5, RL_BORDER),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    def make_callout(text, title="FIELD ENGINEER NOTE:"):
        p_content = Paragraph(f"<b><font color='#{NAVY_HEX}'>{title}</font></b> {text}", callout_style)
        t = Table([[p_content]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), RL_LIGHT_BG),
            ('LEFTPADDING', (0, 0), (0, 0), 10),
            ('RIGHTPADDING', (0, 0), (0, 0), 10),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, 0), (0, 0), 6),
            ('LINELEFT', (0, 0), (0, 0), 3, RL_NAVY),
            ('BOX', (0, 0), (0, 0), 0.5, RL_BORDER),
        ]))
        return t

    # SECTION 1
    story.append(Paragraph("1. Executive Summary & Field Engineering Mandate", h1_style))
    story.append(Paragraph("This document establishes the comprehensive engineering specifications, system architecture, functional capabilities, technical constraints, and boundary scope for the Smart Grid Electricity Management and Battery Energy Storage Automation System (EMS-BESS). Developed from an on-site field electrical engineer's perspective, this solution bridges high-voltage/medium-voltage (MV/LV) substation telemetry, industrial battery energy storage banks, programmable logic controllers (PLCs), digital smart meters, and enterprise customer billing infrastructure into a unified SCADA-EMS platform.", body_style))
    story.append(Spacer(1, 4))
    story.append(make_callout("Modern power distribution networks demand deterministic real-time observability, high-availability telemetry ingestion, and automated peak shaving to prevent transformer thermal overload. Furthermore, zero-trust network isolation is mandatory to protect mission-critical relational database assets (Oracle DB) against cyber-physical intrusion vectors.", "FIELD COMMAND PRINCIPLE:"))
    story.append(Spacer(1, 8))

    # SECTION 2
    story.append(Paragraph("2. Project Scope & Field Boundary Conditions", h1_style))
    story.append(Paragraph("To ensure operational clarity and prevent scope creep during substation commissioning, the boundary conditions of the Electricity Management System are explicitly defined below:", body_style))
    
    story.append(Paragraph("2.1 In-Scope Substation & Field Infrastructure", h2_style))
    story.append(Paragraph("• <b>MV/LV Distribution Network Monitoring:</b> Medium Voltage (MV) to Low Voltage (LV) & MV/LV Transformer Nodes: Integration of digital metering transformers, connection point monitoring (PuntoConexion), line voltage (kV), phase current (A), and power factor.", bullet_style))
    story.append(Paragraph("• <b>Smart Metering Fleet (AMI):</b> Bi-directional telemetry capture from static digital energy meters (Medidor / Lectura), including active energy (kWh), reactive energy (kVARh), voltage sag/swell detection, and 15-minute load profile intervals.", bullet_style))
    story.append(Paragraph("• <b>Industrial Energy Storage (BESS):</b> Automated supervisory control of utility-scale Lithium-Ion / LFP battery storage banks (Bateria). Enforces State of Charge (SoC), State of Health (SoH), charge/discharge C-rates, thermal monitoring, and automated peak shaving during peak tariff hours.", bullet_style))
    story.append(Paragraph("• <b>Field PLC & SCADA Automation:</b> Integration with substation automation PLCs (Siemens S7-1200 / Schneider Modicon via Modbus TCP/RTU) for automated circuit breaker trips, islanding isolation, and emergency fault clearing.", bullet_style))
    story.append(Paragraph("• <b>Customer Billing & Outage Management:</b> Full tariff administration, customer account mapping (Cliente), consumption aggregation, automated invoice generation, and incident ticket lifecycle management (Incidencia).", bullet_style))
    story.append(Paragraph("• <b>Cybersecurity & Containerization:</b> Containerized multi-tier Docker architecture with strict two-tier subnetwork isolation (frontend-net, backend-net) enforcing complete database invisibility from public networks.", bullet_style))

    story.append(Paragraph("2.2 Out-of-Scope Boundary Limits", h2_style))
    story.append(Paragraph("• <b>HV Transmission Grid (> 110 kV):</b> Physical transmission lines exceeding 110 kV utility transmission thresholds.", bullet_style))
    story.append(Paragraph("• <b>Civil Infrastructure Construction:</b> Civil site construction, concrete transformer pad pours, and physical fence security installations.", bullet_style))
    story.append(Paragraph("• <b>Customer Building Internal Wiring:</b> Internal customer household wiring beyond the service entrance breaker and digital meter connection terminals.", bullet_style))
    story.append(Spacer(1, 8))

    # SECTION 3
    story.append(Paragraph("3. Functional Architecture & System Capabilities", h1_style))
    story.append(Paragraph("The EMS-BESS framework delivers five core functional modules engineered to ensure grid resilience, automated load balancing, and accurate financial settlement:", body_style))

    story.append(Paragraph("3.1 Telemetry & High-Frequency Ingestion Module", h2_style))
    story.append(Paragraph("The system ingests high-frequency telemetry data streamed from field meters and PLCs. Each telemetry packet (Lectura) captures active power (kW), total energy (kWh), voltage (V), current (A), and power factor across phase lines.", body_style))
    story.append(Paragraph("• <b>Sampling Frequency:</b> Configurable sub-second polling for critical substation nodes; 15-minute scheduled intervals for residential/commercial smart meters.", bullet_style))
    story.append(Paragraph("• <b>Data Integrity Validation:</b> Automatic validation of voltage ranges (230V ± 10% nominal LV; 11kV/20kV MV) and rejection of corrupted Modbus frames.", bullet_style))

    story.append(Paragraph("3.2 BESS & Peak Shaving Automation Module", h2_style))
    story.append(Paragraph("Industrial battery energy storage systems (BESS) are dynamically controlled via the Battery Service module. The system evaluates grid load against peak tariff thresholds to execute automated charge and discharge cycles.", body_style))
    story.append(Paragraph("• <b>Automated Peak Shaving:</b> When substation transformer load exceeds 85% rated capacity, BESS automatically discharges up to nominal C-rate to shave peak demand.", bullet_style))
    story.append(Paragraph("• <b>SoC Guardrails:</b> Restricts Depth of Discharge (DoD) between 20% minimum SoC and 95% maximum SoC to maximize battery lifecycle (SoH > 80% over 10 years).", bullet_style))
    story.append(Paragraph("• <b>Thermal Safety Shutdown:</b> Continuous thermal and cell balance monitoring with immediate trip signal on cell temperature exceeding 45°C.", bullet_style))

    story.append(Paragraph("3.3 Field PLC & Breaker Control Module", h2_style))
    story.append(Paragraph("Programmable Logic Controllers (PLCs) govern physical breaker states, transformer tap changers, and capacitor bank switching. The PLC service provides secure REST endpoints mapped to Modbus registers.", body_style))

    story.append(Paragraph("3.4 Alarm, Incident Triage & Outage Management", h2_style))
    story.append(Paragraph("Grid anomalies automatically generate Incident records (Incidencia) categorized by severity (CRITICAL, MAJOR, MINOR). Critical alerts trigger real-time HMI visual warnings and dispatch notifications for field maintenance crews.", body_style))

    story.append(Paragraph("3.5 Customer Billing & Multi-Tariff Engine", h2_style))
    story.append(Paragraph("Aggregates time-series consumption data across billing periods, applying dynamic multi-hourly tariffs (Peak, Off-Peak, Valley). Generates detailed customer statements and exports financial reports.", body_style))
    story.append(Spacer(1, 8))

    # SECTION 4
    story.append(Paragraph("4. Technical Requirements & Cybersecurity Architecture", h1_style))
    story.append(Paragraph("The technical architecture is built on enterprise-grade software standards, ensuring deterministic reliability and strict compliance with NERC CIP / IEC 62443 industrial cybersecurity standards.", body_style))

    story.append(Paragraph("4.1 Technology Stack Specifications", h2_style))

    tech_headers = [Paragraph("Layer / Component", tbl_header_style), Paragraph("Technology / Framework", tbl_header_style), Paragraph("Engineering Justification & Role", tbl_header_style)]
    tech_data_pdf = [tech_headers]
    
    raw_tech = [
        ("Backend REST API", "Java 17, Spring Boot 3.x, Spring JPA", "High-concurrency micro-service handling telemetry processing, business logic, and security authentication."),
        ("Relational Persistence", "Oracle Database 19c/21c Enterprise", "ACID-compliant storage for time-series readings, client accounts, BESS status, and relational audit records."),
        ("Frontend HMI", "React 18, TypeScript, Vite, Tailwind CSS", "Operator visual dashboard providing sub-second HMI updates, BESS state meters, interactive grid topology, and incident triage."),
        ("Reverse Proxy & Web Server", "Nginx (Alpine Docker)", "Handles TLS termination, static asset delivery, and secure proxying of /api/* requests to the Spring backend."),
        ("Container Orchestration", "Docker & Docker Compose", "Provides isolated micro-container deployment with deterministic network segmentation and health checks.")
    ]

    for row in raw_tech:
        tech_data_pdf.append([
            Paragraph(row[0], tbl_cell_style),
            Paragraph(row[1], tbl_cell_style),
            Paragraph(row[2], tbl_cell_style)
        ])

    t_tech = Table(tech_data_pdf, colWidths=[110, 140, 254])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), RL_NAVY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, RL_BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, RL_LIGHT_BG]),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 8))

    story.append(Paragraph("4.2 Cybersecurity & Subnetwork Segmentation Architecture", h2_style))
    story.append(Paragraph("To prevent cyber-physical attacks against power grid assets, the system implements a strict multi-tier network topology using Docker isolated subnets:", body_style))
    
    story.append(Paragraph("• <b>Subnetwork 1 — frontend-net:</b> The public-facing network hosting the Nginx Frontend container (port 8181) and the Spring Boot Backend container. Allows operator browser access to the HMI.", bullet_style))
    story.append(Paragraph("• <b>Subnetwork 2 — backend-net:</b> A completely isolated private network connecting the Spring Boot Backend with the Oracle Database container (port 1521). The Frontend container is physically detached from backend-net.", bullet_style))
    story.append(Paragraph("• <b>Zero Host Port Exposure:</b> The oracle-db container explicitly omits public port exposure in docker-compose.yml. Port 1521 is inaccessible from the host machine or public internet.", bullet_style))
    story.append(Paragraph("• <b>Dual-Homed Security Gateway:</b> The Spring Boot Backend acts as a secure dual-homed proxy bridge between the two networks, validating JWT tokens and sanitizing SQL queries via JPA object relational mapping.", bullet_style))
    story.append(Spacer(1, 4))
    
    story.append(make_callout("Substation Firewall Verification Protocol: Running `nc -zv localhost 1521` from the Docker host yields 'Connection Refused', confirming complete port isolation. Direct connection attempts from the frontend container to `oracle-db` fail with 'Host Unreachable'. Access is granted exclusively to the Spring Boot backend service.", "CYBERSECURITY FIELD AUDIT RESULT:"))
    story.append(Spacer(1, 8))

    story.append(Paragraph("4.3 Performance KPIs & Service Level Objectives", h2_style))
    story.append(Paragraph("• <b>HMI Telemetry Latency:</b> System latency for HMI dashboard telemetry updates must not exceed 200 ms under nominal operational load.", bullet_style))
    story.append(Paragraph("• <b>Ingestion Throughput:</b> The backend API ingestion pipeline must sustain at least 1,000 telemetry readings per second per node cluster.", bullet_style))
    story.append(Paragraph("• <b>System Availability:</b> 99.95% annual availability for the core backend telemetry and BESS control services.", bullet_style))
    story.append(Paragraph("• <b>Data Retention:</b> 5-year online time-series retention in Oracle DB for compliance auditing and forensic analysis.", bullet_style))
    story.append(Spacer(1, 8))

    # SECTION 5
    story.append(Paragraph("5. Operational Field Safety, Fallback & Maintenance Standards", h1_style))
    story.append(Paragraph("Field operations in electrical substations require strict adherence to international electrical safety codes and fail-safe automated behaviors:", body_style))

    story.append(Paragraph("5.1 Electrical Safety & Regulatory Compliance", h2_style))
    story.append(Paragraph("• <b>IEEE 519 Standard:</b> Harmonic control compliance for non-linear inverter loads (BESS solar/wind interconnections).", bullet_style))
    story.append(Paragraph("• <b>IEC 61850 / IEC 60870-5-104:</b> Communication networks and system architecture for substation automation.", bullet_style))
    story.append(Paragraph("• <b>NFPA 70E / NEC Code:</b> Standard for electrical safety in client workplaces and high-voltage substation yards.", bullet_style))

    story.append(Paragraph("5.2 Fail-Safe Operating & Emergency Protocols", h2_style))
    story.append(Paragraph("• <b>Autonomous Local PLC Fallback:</b> In the event of total network or backend disconnection, field PLCs automatically revert to autonomous local control mode based on hardwired voltage/frequency sensors.", bullet_style))
    story.append(Paragraph("• <b>Hardwired Thermal Battery Cutoff:</b> High-temperature thermal sensors on BESS units initiate hardwired contactor trips independent of software application state.", bullet_style))
    story.append(Paragraph("• <b>Audit Trail & Event Logging:</b> All control actions (breaker operations, BESS parameter overrides, manual trip signals) are recorded in tamper-evident Oracle DB audit tables with operator ID and millisecond timestamp.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF document successfully created at: {filename}")


if __name__ == "__main__":
    out_dir = "/Users/jordimaicas/Downloads/electricidad"
    docx_path = os.path.join(out_dir, "Smart_Grid_Electricity_Management_System_Specifications.docx")
    pdf_path = os.path.join(out_dir, "Smart_Grid_Electricity_Management_System_Specifications.pdf")
    
    generate_word_document(docx_path)
    generate_pdf_document(pdf_path)
