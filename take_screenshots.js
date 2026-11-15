// Script mejorado: navega el SPA por los links exactos del sidebar
const puppeteer = require('/opt/homebrew/lib/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8181';

const OUTDIR_ES = path.join(__dirname, 'screenshots', 'es');
const OUTDIR_CS = path.join(__dirname, 'screenshots', 'cs');
[OUTDIR_ES, OUTDIR_CS].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Cada nav item: label de fichero + parte del texto del enlace en ES y en CS
const NAV_ITEMS = [
  { label: '01_dashboard',       es: 'Dashboard',     cs: 'Nástěnka'            },
  { label: '02_scada_plcs',      es: 'SCADA',         cs: 'SCADA'               },
  { label: '03_clientes',        es: 'Clientes',      cs: 'Klienti'             },
  { label: '04_contadores',      es: 'Contadores',    cs: 'Elektroměry'         },
  { label: '05_incidencias',     es: 'Incidencias',   cs: 'Incidenty'           },
  { label: '06_bess_monitoring', es: 'Monitoreo',     cs: 'Monitorování'        },
  { label: '07_mapa_bess',       es: 'Mapa',          cs: 'Mapa'                },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Hace click en el primer elemento del nav/aside cuyo texto incluye 'needle'
async function clickNav(page, needle) {
  return page.evaluate((n) => {
    // Busca en todos los hijos del sidebar/aside/nav
    const all = Array.from(document.querySelectorAll(
      'aside *, nav *, [class*="sidebar"] *, [class*="Sidebar"] *, [class*="nav"] *'
    ));
    // Filtra: sin hijos de texto propios, contiene el texto buscado (case-insensitive)
    const el = all.find(e =>
      e.textContent.trim().toLowerCase().includes(n.toLowerCase()) &&
      !Array.from(e.children).some(c => c.textContent.trim().toLowerCase().includes(n.toLowerCase()))
    );
    if (el) { el.click(); return el.textContent.trim(); }
    // Fallback: cualquier elemento clickable con el texto
    const any = Array.from(document.querySelectorAll('*')).find(e =>
      (e.tagName === 'A' || e.tagName === 'BUTTON' || e.getAttribute('role') === 'button') &&
      e.textContent.trim().toLowerCase().includes(n.toLowerCase())
    );
    if (any) { any.click(); return any.textContent.trim(); }
    return null;
  }, needle);
}

async function switchLang(page, code) {
  await page.evaluate((c) => {
    // Primero intenta clicar el botón con el código de idioma
    const btns = Array.from(document.querySelectorAll('button, span, div[role="button"]'));
    const btn = btns.find(b => b.textContent.trim().toUpperCase() === c.toUpperCase() && b.offsetParent);
    if (btn) { btn.click(); return; }
    // Fallback: localStorage
    localStorage.setItem('lang', c.toLowerCase());
  }, code);
  await sleep(800);
  // Si el idioma no cambió via click, recarga con localStorage ya seteado
  const currentLang = await page.evaluate(() => localStorage.getItem('lang') || 'es');
  if (currentLang.toLowerCase() !== code.toLowerCase()) {
    await page.evaluate((c) => { localStorage.setItem('lang', c.toLowerCase()); }, code);
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);
  }
}

async function captureAll(page, outDir, navKey, langLabel) {
  console.log(`\n[${langLabel}] Starting capture in ${outDir}`);
  for (const item of NAV_ITEMS) {
    const needle = item[navKey];
    const clicked = await clickNav(page, needle);
    await sleep(1800);
    const file = path.join(outDir, `${item.label}.png`);
    await page.screenshot({ path: file });
    if (clicked) {
      console.log(`[${langLabel}] ✓ ${item.label}  (clicked: "${clicked}")`);
    } else {
      console.warn(`[${langLabel}] ⚠ ${item.label}  — nav item NOT found for: "${needle}"`);
    }
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1600, height: 900 },
  });

  const page = await browser.newPage();

  // ── ESPAÑOL ───────────────────────────────────────────────────────────────
  console.log('═══ Loading app in ESPAÑOL (ES) ═══');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(1200);
  await switchLang(page, 'ES');
  await captureAll(page, OUTDIR_ES, 'es', 'ES');

  // ── CHECO ─────────────────────────────────────────────────────────────────
  console.log('\n═══ Loading app in CHECO (CS) ═══');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(1200);
  await switchLang(page, 'CS');
  await captureAll(page, OUTDIR_CS, 'cs', 'CS');

  await browser.close();
  console.log('\n✅ All screenshots complete!');
  console.log(`   ES: ${OUTDIR_ES}`);
  console.log(`   CS: ${OUTDIR_CS}`);
  ['es', 'cs'].forEach(l => {
    const d = path.join(__dirname, 'screenshots', l);
    console.log(`\n[${l.toUpperCase()}]:`, fs.readdirSync(d).join(', '));
  });
})();
