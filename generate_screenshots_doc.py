"""
Genera un documento Word con todos los screenshots capturados de la plataforma
en español (ES) y checo (CS).
"""
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENTATION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

# ── Colores corporativos ────────────────────────────────────────────────────
NAVY   = RGBColor(0x1B, 0x36, 0x5D)
STEEL  = RGBColor(0x4A, 0x77, 0x7A)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
GOLD   = RGBColor(0xF5, 0xA6, 0x23)

BASE   = os.path.dirname(os.path.abspath(__file__))
SHOTS  = os.path.join(BASE, 'screenshots')

SCREENS = [
    ('01_dashboard',       'Panel de Control / Nástěnka',           'Dashboard principal con KPIs en tiempo real, histórico de incidencias mensual, indicadores de seguridad del firewall y acciones rápidas de operación de campo.'),
    ('02_scada_plcs',      'Visualizador SCADA & PLCs / Zobrazovač SCADA a PLC',  'Visualizador SCADA con topología de red eléctrica, estado de PLCs de campo, métricas de tensión/corriente y control de interruptores automáticos.'),
    ('03_clientes',        'Clientes / Klienti',                    'Gestión de clientes industriales y utilities: Iberdrola, Endesa, Naturgy, Acciona, etc. Vista de contratos, NIF y estado de facturación.'),
    ('04_contadores',      'Contadores / Elektroměry',              'Flota de medidores inteligentes AMI: número de serie, ubicación, tarifa (RESIDENCIAL / COMERCIAL / INDUSTRIAL), estado de conexión y telemetría en vivo.'),
    ('05_incidencias',     'Incidencias / Incidenty',               'Sistema de gestión de alarmas y averías: triage por severidad (CRÍTICA / MAYOR / MENOR), estado del ticket y asignación a cuadrillas de campo.'),
    ('06_bess_monitoring', 'Monitoreo BESS / Monitorování BESS',   'Panel de monitoreo de baterías de almacenamiento industrial (BESS): SoC, SoH, temperatura de celda, flujo energético y ciclos de carga/descarga.'),
    ('07_mapa_bess',       'Mapa BESS España / Mapa BESS Španělsko','Mapa interactivo de España con todas las ubicaciones de los bancos BESS desplegados, capacidad MW por nodo y estado operativo en tiempo real.'),
]

def set_cell_bg(cell, hex_color):
    """Establece color de fondo de celda en tabla Word."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), hex_color)
    shd.set(qn('w:val'), 'clear')
    tcPr.append(shd)

def add_heading(doc, text, level=1, color=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(18 if level == 1 else 13)
    run.font.color.rgb = color or NAVY
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(6)
    return p

def add_screenshot_section(doc, label, title_es_cs, description, lang):
    img_path = os.path.join(SHOTS, lang, f'{label}.png')
    if not os.path.exists(img_path):
        doc.add_paragraph(f'[Imagen no encontrada: {img_path}]')
        return

    # ── Título de la sección ────────────────────────────────────────────────
    p = doc.add_paragraph()
    run = p.add_run(title_es_cs)
    run.bold = True
    run.font.size = Pt(13)
    run.font.color.rgb = NAVY
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after  = Pt(4)

    # ── Descripción ─────────────────────────────────────────────────────────
    desc_p = doc.add_paragraph(description)
    desc_p.runs[0].font.size = Pt(9)
    desc_p.runs[0].font.color.rgb = STEEL
    desc_p.paragraph_format.space_after = Pt(6)

    # ── Imagen ──────────────────────────────────────────────────────────────
    doc.add_picture(img_path, width=Inches(6.0))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ── Separador ───────────────────────────────────────────────────────────
    doc.add_paragraph()

def build_doc():
    doc = Document()

    # Márgenes
    for section in doc.sections:
        section.top_margin    = Cm(2)
        section.bottom_margin = Cm(2)
        section.left_margin   = Cm(2.2)
        section.right_margin  = Cm(2.2)

    # ── PORTADA ─────────────────────────────────────────────────────────────
    # Tabla de portada con fondo navy
    tbl = doc.add_table(rows=1, cols=1)
    tbl.style = 'Table Grid'
    cell = tbl.cell(0, 0)
    set_cell_bg(cell, '1B365D')
    cell.width = Inches(6.5)

    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after  = Pt(6)
    r = p.add_run('⚡  ELECTRICIDAD PRO SYSTEM')
    r.bold = True
    r.font.size = Pt(22)
    r.font.color.rgb = WHITE

    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run('Smart Grid EMS-BESS Platform')
    r2.font.size = Pt(14)
    r2.font.color.rgb = GOLD

    p3 = cell.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_after = Pt(24)
    r3 = p3.add_run('Capturas de Pantalla de la Plataforma — Screenshots / Snímky obrazovky')
    r3.font.size = Pt(9)
    r3.font.color.rgb = RGBColor(0xAA, 0xCC, 0xDD)

    doc.add_paragraph()

    # ── INTRO ────────────────────────────────────────────────────────────────
    intro = doc.add_paragraph(
        'Este documento presenta las capturas de pantalla de la plataforma EMS-BESS en sus dos '
        'versiones lingüísticas disponibles: Español (ES) y Checo (CS). La plataforma opera en '
        'modo demostración (offline) con datos mock generados automáticamente, sin requerir '
        'conexión activa a Oracle DB.'
    )
    intro.runs[0].font.size = Pt(9.5)
    intro.runs[0].font.color.rgb = STEEL
    intro.paragraph_format.space_after = Pt(14)

    # ══════════════════════════════════════════════════════════════════════════
    # SECCIÓN ESPAÑOL
    # ══════════════════════════════════════════════════════════════════════════
    add_heading(doc, '🇪🇸  Versión en Español (ES)', level=1, color=NAVY)

    for label, title, desc in SCREENS:
        add_screenshot_section(doc, label, title.split(' / ')[0], desc, 'es')

    # ══════════════════════════════════════════════════════════════════════════
    # SECCIÓN CHECO
    # ══════════════════════════════════════════════════════════════════════════
    doc.add_page_break()
    add_heading(doc, '🇨🇿  Česká verze (CS) — Versión en Checo', level=1, color=NAVY)

    for label, title, desc in SCREENS:
        cs_title = title.split(' / ')[-1] if ' / ' in title else title
        add_screenshot_section(doc, label, cs_title, desc, 'cs')

    # Guardar
    out = os.path.join(BASE, 'EMS_BESS_Platform_Screenshots.docx')
    doc.save(out)
    print(f'✅ Documento guardado: {out}')
    return out

build_doc()
