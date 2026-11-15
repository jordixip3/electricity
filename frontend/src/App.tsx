import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES, makeT, type Lang, type TranslationKey } from './i18n/translations';

// --- TYPES ---
interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaAlta: string;
}

interface Plc {
  id: number;
  nombre: string;
  ip: string;
  estado: string;
  ubicacion: string;
  ultimaConexion?: string;
}

interface Medidor {
  id: number;
  numeroSerie: string;
  ubicacion: string;
  tipoTarifa: 'RESIDENCIAL' | 'COMERCIAL' | 'INDUSTRIAL';
  activo: boolean;
  cliente: Cliente;
  plc?: Plc;
  voltaje?: number;
  corriente?: number;
  potencia?: number;
  frecuencia?: number;
  estadoConexion?: string;
}

interface Incidencia {
  id: number;
  medidor: Medidor;
  fechaIncidencia: string;
  descripcion: string;
  estado: string;
}

interface BateriaStatus {
  id: number;
  bateriaId: number;
  flowState?: 'CARGANDO' | 'SUMINISTRANDO' | 'STANDBY' | string;
  voltage: number;
  current: number;
  frequency?: number;
  power?: number;
  soc?: number;
  temperature: number;
  durationSeconds?: number;
  formattedDuration?: string;
  esHoraValle?: boolean;
  permiteCargar?: boolean;
  permiteSuministrar?: boolean;
  puntoConexionNombre?: string;
  timestamp: string;
}

// --- FALLBACK MOCK DATA (used when Oracle DB is offline) ---
const mockClientes: Cliente[] = [
  { id: 1,  nombre: "Iberdrola Renovables S.L.",   email: "ops@iberdrola.es",      telefono: "910100200", direccion: "Calle Tomás Redondo 1, Madrid",     fechaAlta: "2024-01-10" },
  { id: 2,  nombre: "Endesa Generación S.A.",       email: "tech@endesa.es",       telefono: "934501234", direccion: "Rambla del Rector 1, Barcelona",  fechaAlta: "2024-02-14" },
  { id: 3,  nombre: "Naturgy Energy Group",         email: "info@naturgy.com",     telefono: "915200300", direccion: "Plaça del Gas 1, Barcelona",       fechaAlta: "2024-03-05" },
  { id: 4,  nombre: "Acciona Energía S.A.",         email: "energy@acciona.com",   telefono: "916321000", direccion: "Avda. Ciudad de la Innovación 5, Pamplona", fechaAlta: "2024-03-22" },
  { id: 5,  nombre: "Repsol Electricidad S.L.",     email: "grid@repsol.com",      telefono: "917121300", direccion: "Méndez Álvaro 44, Madrid",         fechaAlta: "2024-04-11" },
  { id: 6,  nombre: "EDP Renováveis Iberia",        email: "bess@edp.com",         telefono: "913561200", direccion: "Torre Picasso, Madrid",            fechaAlta: "2024-05-08" },
  { id: 7,  nombre: "Ayuntamiento de Sevilla",      email: "grid@sevilla.org",     telefono: "955471111", direccion: "Plaza Nueva 1, Sevilla",           fechaAlta: "2024-06-01" },
  { id: 8,  nombre: "Generalitat de Catalunya",     email: "energia@gencat.cat",   telefono: "934024600", direccion: "Av. Diagonal 403, Barcelona",      fechaAlta: "2024-07-15" },
  { id: 9,  nombre: "Eólica del Cantábrico S.L.",   email: "ops@eolicacant.es",    telefono: "944205800", direccion: "Gran Vía 45, Bilbao",              fechaAlta: "2024-08-20" },
  { id: 10, nombre: "Solar Sur Andaluza S.A.",      email: "solar@solarsur.es",    telefono: "957400500", direccion: "Av. de América 12, Córdoba",       fechaAlta: "2024-09-30" },
];

const mockPlcsBase: Plc[] = [
  { id: 1, nombre: "PLC-ALPHA-01",  ip: "192.168.10.11", estado: "ACTIVO",      ubicacion: "Subestación Alpha 220kV, Madrid" },
  { id: 2, nombre: "PLC-BETA-02",   ip: "192.168.10.12", estado: "ACTIVO",      ubicacion: "Parque Solar Beta, Sevilla" },
  { id: 3, nombre: "PLC-GAMMA-03",  ip: "192.168.10.13", estado: "ACTIVO",      ubicacion: "Planta Industrial Gamma, Barcelona" },
  { id: 4, nombre: "PLC-DELTA-04",  ip: "192.168.10.14", estado: "MANTENIMIENTO",ubicacion: "Subestación Delta 66kV, Bilbao" },
  { id: 5, nombre: "PLC-EPSILON-05",ip: "192.168.10.15", estado: "ACTIVO",      ubicacion: "Parque Eólico Epsilon, Pamplona" },
  { id: 6, nombre: "PLC-ZETA-06",   ip: "192.168.10.16", estado: "ACTIVO",      ubicacion: "Hub Zeta Renovables, Zaragoza" },
  { id: 7, nombre: "PLC-ETA-07",    ip: "192.168.10.17", estado: "DESCONECTADO",ubicacion: "Subestación Eta 132kV, Valencia" },
  { id: 8, nombre: "PLC-THETA-08",  ip: "192.168.10.18", estado: "ACTIVO",      ubicacion: "Centro Control Theta, Córdoba" },
];

const mockMedidores: Medidor[] = [
  { id: 1,  numeroSerie: "CNT-A001", ubicacion: "Subestación Alpha 220kV, Madrid",   tipoTarifa: "INDUSTRIAL",   activo: true, cliente: mockClientes[0], plc: mockPlcsBase[0], voltaje: 230.2, corriente: 42.1, potencia: 9.7,  frecuencia: 50.01 },
  { id: 2,  numeroSerie: "CNT-A002", ubicacion: "Torre Cristal, Madrid",              tipoTarifa: "COMERCIAL",    activo: true, cliente: mockClientes[4], plc: mockPlcsBase[0], voltaje: 228.8, corriente: 35.5, potencia: 8.1,  frecuencia: 49.98 },
  { id: 3,  numeroSerie: "CNT-B001", ubicacion: "Parque Solar Beta, Sevilla",         tipoTarifa: "INDUSTRIAL",   activo: true, cliente: mockClientes[6], plc: mockPlcsBase[1], voltaje: 231.0, corriente: 58.4, potencia: 13.5, frecuencia: 50.02 },
  { id: 4,  numeroSerie: "CNT-B002", ubicacion: "Polígono Sur, Sevilla",              tipoTarifa: "COMERCIAL",    activo: true, cliente: mockClientes[6], plc: mockPlcsBase[1], voltaje: 229.5, corriente: 28.0, potencia: 6.4,  frecuencia: 50.00 },
  { id: 5,  numeroSerie: "CNT-G001", ubicacion: "Planta Industrial Gamma, Barcelona", tipoTarifa: "INDUSTRIAL",   activo: true, cliente: mockClientes[1], plc: mockPlcsBase[2], voltaje: 232.0, corriente: 71.2, potencia: 16.5, frecuencia: 50.01 },
  { id: 6,  numeroSerie: "CNT-G002", ubicacion: "Zona Franca, Barcelona",             tipoTarifa: "COMERCIAL",    activo: true, cliente: mockClientes[7], plc: mockPlcsBase[2], voltaje: 230.5, corriente: 45.3, potencia: 10.4, frecuencia: 49.99 },
  { id: 7,  numeroSerie: "CNT-D001", ubicacion: "Subestación Delta 66kV, Bilbao",    tipoTarifa: "INDUSTRIAL",   activo: false,cliente: mockClientes[8], plc: mockPlcsBase[3], voltaje: 0,     corriente: 0,    potencia: 0,    frecuencia: 0 },
  { id: 8,  numeroSerie: "CNT-E001", ubicacion: "Parque Eólico Epsilon, Pamplona",   tipoTarifa: "INDUSTRIAL",   activo: true, cliente: mockClientes[3], plc: mockPlcsBase[4], voltaje: 229.0, corriente: 62.0, potencia: 14.2, frecuencia: 50.03 },
  { id: 9,  numeroSerie: "CNT-Z001", ubicacion: "Hub Zeta Renovables, Zaragoza",      tipoTarifa: "COMERCIAL",    activo: true, cliente: mockClientes[5], plc: mockPlcsBase[5], voltaje: 230.0, corriente: 30.8, potencia: 7.1,  frecuencia: 50.00 },
  { id: 10, numeroSerie: "CNT-H001", ubicacion: "Centro Control Theta, Córdoba",      tipoTarifa: "INDUSTRIAL",   activo: true, cliente: mockClientes[9], plc: mockPlcsBase[7], voltaje: 231.5, corriente: 55.6, potencia: 12.9, frecuencia: 50.01 },
  { id: 11, numeroSerie: "CNT-R001", ubicacion: "Residencial Noroeste, Madrid",       tipoTarifa: "RESIDENCIAL",  activo: true, cliente: mockClientes[0], voltaje: 229.8, corriente: 12.3, potencia: 2.8,  frecuencia: 49.99 },
  { id: 12, numeroSerie: "CNT-R002", ubicacion: "Urbanización La Palmera, Sevilla",   tipoTarifa: "RESIDENCIAL",  activo: true, cliente: mockClientes[6], voltaje: 230.1, corriente: 10.8, potencia: 2.5,  frecuencia: 50.00 },
];

const mockIncidencias: Incidencia[] = [
  { id: 1, medidor: mockMedidores[0],  fechaIncidencia: "2026-07-10", descripcion: "Pico de tensión detectado (>240V). Posible sobrecarga en ramal.",         estado: "RESUELTA" },
  { id: 2, medidor: mockMedidores[4],  fechaIncidencia: "2026-07-18", descripcion: "Pérdida de comunicación MODBUS durante 14 minutos. PLC-G reiniciado.",     estado: "RESUELTA" },
  { id: 3, medidor: mockMedidores[6],  fechaIncidencia: "2026-07-22", descripcion: "Contador CNT-D001 sin lecturas. Desconexión física detectada por PLC-D.",   estado: "ABIERTA" },
  { id: 4, medidor: mockMedidores[2],  fechaIncidencia: "2026-07-25", descripcion: "Lectura de corriente anómala (>70A). Revisión de fusibles programada.",      estado: "ABIERTA" },
  { id: 5, medidor: mockMedidores[7],  fechaIncidencia: "2026-07-28", descripcion: "Intermitencia de señal RF en el parque eólico durante tormenta eléctrica.",  estado: "ABIERTA" },
  { id: 6, medidor: mockMedidores[1],  fechaIncidencia: "2026-07-30", descripcion: "Firmware desactualizado. Actualización remota completada con éxito.",         estado: "RESUELTA" },
  { id: 7, medidor: mockMedidores[9],  fechaIncidencia: "2026-08-01", descripcion: "Temperatura ambiente fuera de rango en sala de control. Revisión AC.",        estado: "ABIERTA" },
  { id: 8, medidor: mockMedidores[3],  fechaIncidencia: "2026-08-04", descripcion: "Microcorte de 200ms registrado. Origen en suministro municipal de Sevilla.",  estado: "ABIERTA" },
];

// Mock BESS battery status for offline mode
const mockBessStatuses: BateriaStatus[] = [
  { id: 1, bateriaId: 1, flowState: 'SUMINISTRANDO', voltage: 400.5, current: 188.0, frequency: 49.98, power: 130.2, soc: 82.5, temperature: 26.8, durationSeconds: 9240, esHoraValle: false, permiteCargar: true, permiteSuministrar: true, puntoConexionNombre: 'Subestación Alpha 220kV - Bi-direccional', timestamp: new Date().toISOString() },
  { id: 2, bateriaId: 2, flowState: 'CARGANDO',       voltage: 415.2, current: 132.5, frequency: 50.02, power: 95.4,  soc: 45.0, temperature: 24.3, durationSeconds: 4320, esHoraValle: true,  permiteCargar: true, permiteSuministrar: true, puntoConexionNombre: 'Parque Solar Beta - Punto de Inyección',    timestamp: new Date().toISOString() },
  { id: 3, bateriaId: 3, flowState: 'STANDBY',        voltage: 400.1, current: 1.2,   frequency: 50.00, power: 0.5,   soc: 91.0, temperature: 22.1, durationSeconds: 1800, esHoraValle: false, permiteCargar: true, permiteSuministrar: true, puntoConexionNombre: 'Planta Industrial Gamma 66kV - Conexión Flexible', timestamp: new Date().toISOString() },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────
interface AuthState {
  token: string;
  username: string;
  role: string;
}

function LoginScreen({ onLogin, t, lang, changeLang }: {
  onLogin: (auth: AuthState) => void;
  t: (k: TranslationKey) => string;
  lang: Lang;
  changeLang: (l: Lang) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error de autenticación');
      }
      const data = await res.json();
      onLogin({ token: data.token, username: data.username, role: data.role });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(0,242,254,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(112,0,255,0.08) 0%, transparent 50%), #0a0e1a',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', padding: '48px 40px', margin: '20px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,242,254,0.05) inset',
      }}>
        {/* Language selector on Login */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              title={l.name}
              style={{
                background: lang === l.code ? 'rgba(0,242,254,0.18)' : 'rgba(255,255,255,0.03)',
                border: lang === l.code ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                color: lang === l.code ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <span>{l.flag}</span>
              <span style={{ fontSize: '11px' }}>{l.label}</span>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(112,0,255,0.2))',
            border: '1px solid rgba(0,242,254,0.3)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
          }}>⚡</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>{t('login_title')}</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>{t('login_user')}</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)} required
              placeholder="admin / operador"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>{t('login_password')}</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button type="submit" disabled={loading} className="premium-btn" style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px',
            transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? t('login_loading') : t('login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '24px', marginBottom: 0 }}>
          admin / Admin2024! &nbsp;·&nbsp; operador / Operador2024! &nbsp;·&nbsp; tecnico1 / Tecnico2024!
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── TECH VIEW (Vista Técnico de Campo — Mobile-first) ───────────────────────

function TechView({ auth, onLogout, t, lang, changeLang }: {
  auth: AuthState;
  onLogout: () => void;
  t: (k: TranslationKey) => string;
  lang: Lang;
  changeLang: (l: Lang) => void;
}) {
  const [activeScreen, setActiveScreen] = useState<'home' | 'incidencias' | 'contadores'>('home');

  const [medidores, setMedidores] = useState<Medidor[]>(mockMedidores);
  const [incidencias, setIncidencias] = useState<Incidencia[]>(mockIncidencias);
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [apiConnected, setApiConnected] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Form state for new incidencia
  const [showIncidenciaForm, setShowIncidenciaForm] = useState(false);
  const [newInc, setNewInc] = useState({ medidorId: '', descripcion: '', fecha: '' });
  const [incSubmitting, setIncSubmitting] = useState(false);

  // Form state for new contador
  const [showContadorForm, setShowContadorForm] = useState(false);
  const [newCnt, setNewCnt] = useState({ numeroSerie: '', ubicacion: '', clienteId: '' });
  const [cntSubmitting, setCntSubmitting] = useState(false);

  // Confirm baja modal
  const [confirmarBajaId, setConfirmarBajaId] = useState<number | null>(null);

  const API_BASE = '/api';
  const headers = { 'Authorization': `Bearer ${auth.token}` };

  const notify = (message: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    try {
      const [rM, rI, rC] = await Promise.all([
        fetch(`${API_BASE}/medidores`, { headers }),
        fetch(`${API_BASE}/incidencias`, { headers }),
        fetch(`${API_BASE}/clientes`, { headers }),
      ]);
      if (!rM.ok || !rI.ok || !rC.ok) throw new Error('API error');
      setMedidores(await rM.json());
      setIncidencias(await rI.json());
      setClientes(await rC.json());
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auth]);

  const handleReportarIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInc.medidorId || !newInc.descripcion) return;
    setIncSubmitting(true);
    const fecha = newInc.fecha || new Date().toISOString().split('T')[0];
    if (apiConnected) {
      try {
        const res = await fetch(`${API_BASE}/incidencias`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ medidor: { id: parseInt(newInc.medidorId) }, descripcion: newInc.descripcion, fechaIncidencia: fecha, estado: 'ABIERTA' }),
        });
        if (res.ok) {
          notify('✅ Incidencia reportada correctamente');
          setShowIncidenciaForm(false);
          setNewInc({ medidorId: '', descripcion: '', fecha: '' });
          await loadData();
        } else {
          notify('Error al registrar incidencia', 'danger');
        }
      } catch { notify('Error de conexión', 'danger'); }
    } else {
      const medObj = medidores.find(m => m.id === parseInt(newInc.medidorId));
      if (medObj) {
        setIncidencias(prev => [{ id: Date.now(), medidor: medObj, fechaIncidencia: fecha, descripcion: newInc.descripcion, estado: 'ABIERTA' }, ...prev]);
        notify('Incidencia registrada (Offline/Demo)');
        setShowIncidenciaForm(false);
        setNewInc({ medidorId: '', descripcion: '', fecha: '' });
      }
    }
    setIncSubmitting(false);
  };

  const handleResolver = async (id: number) => {
    if (apiConnected) {
      const res = await fetch(`${API_BASE}/incidencias/${id}/resolver`, { method: 'PUT', headers });
      if (res.ok) { notify('Incidencia marcada como resuelta'); await loadData(); }
      else notify('Error al resolver', 'danger');
    } else {
      setIncidencias(prev => prev.map(i => i.id === id ? { ...i, estado: 'RESUELTA' } : i));
      notify('Resuelta (Demo)');
    }
  };

  const handleAltaContador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCnt.numeroSerie || !newCnt.clienteId) return;
    setCntSubmitting(true);
    if (apiConnected) {
      try {
        const res = await fetch(`${API_BASE}/medidores`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ numeroSerie: newCnt.numeroSerie, ubicacion: newCnt.ubicacion, cliente: { id: parseInt(newCnt.clienteId) } }),
        });
        if (res.ok) {
          notify('✅ Contador dado de alta correctamente');
          setShowContadorForm(false);
          setNewCnt({ numeroSerie: '', ubicacion: '', clienteId: '' });
          await loadData();
        } else {
          const err = await res.text();
          notify(err || 'Error al dar de alta contador', 'danger');
        }
      } catch { notify('Error de conexión', 'danger'); }
    } else {
      const cliObj = clientes.find(c => c.id === parseInt(newCnt.clienteId));
      if (cliObj) {
        setMedidores(prev => [...prev, { id: Date.now(), numeroSerie: newCnt.numeroSerie, ubicacion: newCnt.ubicacion, tipoTarifa: 'RESIDENCIAL', activo: true, cliente: cliObj }]);
        notify('Contador registrado (Demo)');
        setShowContadorForm(false);
        setNewCnt({ numeroSerie: '', ubicacion: '', clienteId: '' });
      }
    }
    setCntSubmitting(false);
  };

  const handleBajaContador = async (id: number) => {
    if (apiConnected) {
      const res = await fetch(`${API_BASE}/medidores/${id}`, { method: 'DELETE', headers });
      if (res.ok) { notify('Contador dado de baja'); setConfirmarBajaId(null); await loadData(); }
      else notify('Error al dar de baja', 'danger');
    } else {
      setMedidores(prev => prev.filter(m => m.id !== id));
      notify('Contador eliminado (Demo)');
      setConfirmarBajaId(null);
    }
  };

  const abiertas = incidencias.filter(i => i.estado.toUpperCase() === 'ABIERTA').length;

  return (
    <div className="tech-container">
      {/* HEADER */}
      <header className="tech-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#00f2fe,#7000ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{t('login_title')}</div>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', letterSpacing: '1px' }}>{t('tech_role')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{auth.username}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: apiConnected ? '#10b981' : '#f59e0b' }}></div>
              <span style={{ fontSize: '10px', color: apiConnected ? '#10b981' : '#f59e0b' }}>{apiConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => changeLang(l.code)} title={l.name}
                style={{ background: lang === l.code ? 'rgba(0,242,254,0.15)' : 'transparent', border: lang === l.code ? '1px solid rgba(0,242,254,0.4)' : '1px solid transparent', borderRadius: '6px', padding: '2px 5px', fontSize: '11px', color: lang === l.code ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '700' }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 10px', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>{t('exit')}</button>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, width: 'calc(100% - 32px)', maxWidth: '560px', background: notification.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)', color: '#fff', padding: '14px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {notification.message}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="tech-main">

        {/* HOME SCREEN */}
        {activeScreen === 'home' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>{t('tech_greeting')}, {auth.username} 👋</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('tech_summary')}</p>

            {/* STAT PILLS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div className="tech-stat-pill">
                <div style={{ fontSize: '32px', fontWeight: '800', color: abiertas > 0 ? '#fbbf24' : '#34d399' }}>{abiertas}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('tech_open_inc')}</div>
              </div>
              <div className="tech-stat-pill">
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{medidores.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('tech_meters')}</div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('tech_quick_actions')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              <button onClick={() => { setActiveScreen('incidencias'); setShowIncidenciaForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', padding: '18px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{t('tech_report_inc')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t('tech_report_inc_sub')}</div>
                </div>
                <svg style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <button onClick={() => { setActiveScreen('contadores'); setShowContadorForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.12)', borderRadius: '14px', padding: '18px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{t('tech_reg_meter')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t('tech_reg_meter_sub')}</div>
                </div>
                <svg style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* LATEST INCIDENCIAS */}
            {incidencias.length > 0 && (
              <>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('tech_latest_inc')}</h3>
                {incidencias.slice(0, 3).map(i => (
                  <div key={i.id} className={`tech-card ${i.estado.toUpperCase() === 'ABIERTA' ? 'tech-card-accent-open' : 'tech-card-accent-closed'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.medidor?.numeroSerie}</span>
                      <span className={`badge ${i.estado.toUpperCase() === 'RESUELTA' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>{i.estado}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#fff', fontWeight: '500', margin: 0 }}>{i.descripcion}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>{i.fechaIncidencia}</p>
                  </div>
                ))}
                {incidencias.length > 3 && (
                  <button onClick={() => setActiveScreen('incidencias')} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>{t('tech_see_all')} ({incidencias.length})</button>
                )}
              </>
            )}
          </div>
        )}

        {/* INCIDENCIAS SCREEN */}
        {activeScreen === 'incidencias' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{t('nav_incidents')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{incidencias.length} registradas · {abiertas} abiertas</p>

            {incidencias.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontWeight: '600' }}>{t('tech_no_incidents')}</p>
              </div>
            )}

            {incidencias.map(i => (
              <div key={i.id} className={`tech-card ${i.estado.toUpperCase() === 'ABIERTA' ? 'tech-card-accent-open' : 'tech-card-accent-closed'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{i.medidor?.numeroSerie}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{i.medidor?.cliente?.nombre}</div>
                  </div>
                  <span className={`badge ${i.estado.toUpperCase() === 'RESUELTA' ? 'badge-success' : 'badge-warning'}`}>{i.estado}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 8px' }}>{i.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📅 {i.fechaIncidencia}</span>
                  {i.estado.toUpperCase() === 'ABIERTA' && (
                    <button onClick={() => handleResolver(i.id)} className="tech-btn-success">{t('resolve')} ✓</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTADORES SCREEN */}
        {activeScreen === 'contadores' && (
          <div className="fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{t('tech_meters')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{medidores.length} {t('tech_in_system')}</p>

            {medidores.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📟</div>
                <p style={{ fontWeight: '600' }}>{t('tech_no_meters')}</p>
              </div>
            )}

            {medidores.map(m => (
              <div key={m.id} className="tech-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{m.numeroSerie}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>👤 {m.cliente?.nombre}</div>
                    {m.ubicacion && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {m.ubicacion}</div>}
                  </div>
                  <button onClick={() => setConfirmarBajaId(m.id)} className="tech-btn-danger">{t('tech_deregister')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB BUTTON */}
      {activeScreen === 'incidencias' && (
        <button className="tech-fab" onClick={() => setShowIncidenciaForm(true)} title="Reportar Incidencia">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#050510" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}
      {activeScreen === 'contadores' && (
        <button className="tech-fab" onClick={() => setShowContadorForm(true)} title="Alta de Contador">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#050510" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}

      {/* BOTTOM NAV */}
      <nav className="tech-bottom-nav">
        <button className={`tech-nav-btn ${activeScreen === 'home' ? 'active' : ''}`} onClick={() => setActiveScreen('home')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {t('tech_nav_home')}
        </button>
        <button className={`tech-nav-btn ${activeScreen === 'incidencias' ? 'active' : ''}`} onClick={() => setActiveScreen('incidencias')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {t('nav_incidents')}
          {abiertas > 0 && <span style={{ position: 'absolute', top: '6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{abiertas}</span>}
        </button>
        <button className={`tech-nav-btn ${activeScreen === 'contadores' ? 'active' : ''}`} onClick={() => setActiveScreen('contadores')} style={{ position: 'relative' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          {t('tech_meters')}
        </button>
      </nav>

      {/* MODAL: REPORTAR INCIDENCIA */}
      {showIncidenciaForm && (
        <div className="tech-modal-overlay" onClick={() => setShowIncidenciaForm(false)}>
          <div className="tech-modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>{t('tech_report_inc')}</h3>
              <button onClick={() => setShowIncidenciaForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleReportarIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="tech-label">{t('tech_label_meter')}</label>
                <select required className="tech-select" value={newInc.medidorId} onChange={e => setNewInc({ ...newInc, medidorId: e.target.value })}>
                  <option value="">{t('sel_meter_ph')}</option>
                  {medidores.map(m => <option key={m.id} value={m.id}>{m.numeroSerie} — {m.ubicacion || m.cliente?.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="tech-label">{t('tech_label_desc')}</label>
                <textarea required rows={4} className="tech-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} value={newInc.descripcion} onChange={e => setNewInc({ ...newInc, descripcion: e.target.value })} placeholder="Ej: Pantalla del display rota, error de lectura remota..."/>
              </div>
              <div>
                <label className="tech-label">{t('tech_label_date')}</label>
                <input type="date" className="tech-input" value={newInc.fecha} onChange={e => setNewInc({ ...newInc, fecha: e.target.value })} />
              </div>
              <button type="submit" disabled={incSubmitting} className="tech-btn-primary" style={{ marginTop: '8px', opacity: incSubmitting ? 0.7 : 1 }}>
                {incSubmitting ? t('tech_btn_sending') : t('tech_btn_submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALTA DE CONTADOR */}
      {showContadorForm && (
        <div className="tech-modal-overlay" onClick={() => setShowContadorForm(false)}>
          <div className="tech-modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>{t('tech_reg_meter')}</h3>
              <button onClick={() => setShowContadorForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleAltaContador} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="tech-label">{t('tech_label_serial')}</label>
                <input required type="text" className="tech-input" value={newCnt.numeroSerie} onChange={e => setNewCnt({ ...newCnt, numeroSerie: e.target.value })} placeholder="Ej: CNT-0042" />
              </div>
              <div>
                <label className="tech-label">{t('tech_label_location')}</label>
                <input type="text" className="tech-input" value={newCnt.ubicacion} onChange={e => setNewCnt({ ...newCnt, ubicacion: e.target.value })} placeholder="Ej: Calle Mayor 12, Bajo" />
              </div>
              <div>
                <label className="tech-label">{t('tech_label_client')}</label>
                <select required className="tech-select" value={newCnt.clienteId} onChange={e => setNewCnt({ ...newCnt, clienteId: e.target.value })}>
                  <option value="">{t('sel_client_ph')}</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <button type="submit" disabled={cntSubmitting} className="tech-btn-primary" style={{ marginTop: '8px', opacity: cntSubmitting ? 0.7 : 1 }}>
                {cntSubmitting ? t('tech_btn_registering') : t('tech_btn_register')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR BAJA */}
      {confirmarBajaId !== null && (
        <div className="tech-modal-overlay" onClick={() => setConfirmarBajaId(null)}>
          <div className="tech-modal-sheet" style={{ maxHeight: '50vh' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>{t('tech_confirm_title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {t('tech_confirm_msg')} <strong style={{ color: '#fff' }}>{medidores.find(m => m.id === confirmarBajaId)?.numeroSerie}</strong>{t('tech_confirm_irrev')}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmarBajaId(null)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontFamily: 'inherit', fontSize: '15px', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={() => handleBajaContador(confirmarBajaId)} className="tech-btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #c0392b)', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}>{t('tech_deregister')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── SCADA VIEW — Centro de Control SCADA Visual ─────────────────────────────

function ScadaGauge({ label, value, min, max, unit, color }: {
  label: string; value: number; min: number; max: number; unit: string; color: string;
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const radius = 38;
  const circumference = Math.PI * radius; // half-circle
  const dashLen = pct * circumference;
  const needleAngle = -180 + pct * 180;

  return (
    <div style={{ textAlign: 'center', minWidth: '120px' }}>
      <svg viewBox="0 0 100 58" style={{ width: '100%', maxWidth: '150px' }}>
        {/* Background arc */}
        <path d={`M 12 52 A ${radius} ${radius} 0 0 1 88 52`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        {/* Filled arc */}
        <path d={`M 12 52 A ${radius} ${radius} 0 0 1 88 52`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
        {/* Needle */}
        <line x1="50" y1="52" x2="50" y2="22"
          stroke="#fff" strokeWidth="2" strokeLinecap="round"
          style={{ transformOrigin: '50px 52px', transform: `rotate(${needleAngle}deg)`, transition: 'transform 0.6s ease' }} />
        <circle cx="50" cy="52" r="4" fill={color} />
        {/* Value text */}
        <text x="50" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="Outfit">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
        <text x="50" y="56" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="Outfit">
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function ScadaView({ auth, medidores, fetchData, t = (k: TranslationKey) => k }: {
  auth: AuthState; medidores: Medidor[]; apiConnected?: boolean; fetchData: () => void; t?: (k: TranslationKey) => string;
}) {
  const [plcs, setPlcs] = useState<Plc[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<Medidor | null>(null);
  const [selectedPlcNode, setSelectedPlcNode] = useState<Plc | null>(null);
  const [rebootingPlc, setRebootingPlc] = useState<number | null>(null);
  const [scadaTick, setScadaTick] = useState(0);
  const [plcFilter, setPlcFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const API_BASE = '/api';
  const headers = { 'Authorization': `Bearer ${auth.token}` };

  // Load PLCs
  useEffect(() => {
    const loadPlcs = async () => {
      try {
        const res = await fetch(`${API_BASE}/plcs`, { headers });
        if (res.ok) setPlcs(await res.json());
      } catch { /* offline fallback */ }
    };
    loadPlcs();
  }, [auth]);

  // Simulated live tick every 3s for gauge animation
  useEffect(() => {
    const timer = setInterval(() => {
      setScadaTick(t => t + 1);
      fetchData(); // Re-fetch medidores with new fluctuation values
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handlePingPlc = async (plcId: number) => {
    try {
      const res = await fetch(`${API_BASE}/plcs/${plcId}/ping`, { method: 'POST', headers });
      if (res.ok) {
        const updated = await res.json();
        setPlcs(prev => prev.map(p => p.id === plcId ? updated : p));
        if (selectedPlcNode?.id === plcId) setSelectedPlcNode(updated);
      }
    } catch { /* noop */ }
  };

  const handleRebootPlc = async (plcId: number) => {
    setRebootingPlc(plcId);
    try {
      const res = await fetch(`${API_BASE}/plcs/${plcId}/reboot`, { method: 'POST', headers });
      if (res.ok) {
        const updated = await res.json();
        setPlcs(prev => prev.map(p => p.id === plcId ? updated : p));
        if (selectedPlcNode?.id === plcId) setSelectedPlcNode(updated);
      }
    } catch { /* noop */ }
    setTimeout(() => setRebootingPlc(null), 2500);
  };

  const handleToggleMeterConnection = async (meter: Medidor) => {
    const newState = meter.estadoConexion === 'CONECTADO' ? 'DESCONECTADO' : 'CONECTADO';
    try {
      await fetch(`${API_BASE}/medidores/${meter.id}/conexion?estadoConexion=${newState}`, { method: 'PUT', headers });
      fetchData();
      if (selectedMeter?.id === meter.id) {
        setSelectedMeter({ ...meter, estadoConexion: newState });
      }
    } catch { /* noop */ }
  };

  // Group meters by PLC
  const metersByPlc: Record<number, Medidor[]> = {};
  const unassignedMeters: Medidor[] = [];
  medidores.forEach(m => {
    if (m.plc?.id) {
      if (!metersByPlc[m.plc.id]) metersByPlc[m.plc.id] = [];
      metersByPlc[m.plc.id].push(m);
    } else {
      unassignedMeters.push(m);
    }
  });

  // Filtered medidores list
  const filteredMedidores = medidores.filter(m => {
    if (plcFilter !== null && m.plc?.id !== plcFilter) return false;
    if (statusFilter === 'CONECTADO' && m.estadoConexion !== 'CONECTADO') return false;
    if (statusFilter === 'DESCONECTADO' && m.estadoConexion === 'CONECTADO') return false;
    if (statusFilter === 'ALARMA' && (m.estadoConexion !== 'CONECTADO' || (m.voltaje || 0) <= 238)) return false;
    return true;
  });

  const connectedCount = medidores.filter(m => m.estadoConexion === 'CONECTADO').length;
  const disconnectedCount = medidores.filter(m => m.estadoConexion !== 'CONECTADO').length;
  const alarmCount = medidores.filter(m => m.estadoConexion === 'CONECTADO' && (m.voltaje || 0) > 238).length;

  // Compute aggregate stats for live gauges
  const liveMeters = medidores.filter(m => m.estadoConexion === 'CONECTADO');
  const avgVoltage = liveMeters.length > 0 ? liveMeters.reduce((s, m) => s + (m.voltaje || 0), 0) / liveMeters.length : 0;
  const avgCurrent = liveMeters.length > 0 ? liveMeters.reduce((s, m) => s + (m.corriente || 0), 0) / liveMeters.length : 0;
  const totalPower = liveMeters.reduce((s, m) => s + (m.potencia || 0), 0);
  const avgFreq = liveMeters.length > 0 ? liveMeters.reduce((s, m) => s + (m.frecuencia || 0), 0) / liveMeters.length : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* TOP STATUS BAR */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Live Status */}
        <div className="scada-card" style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div className="scada-live-dot" style={{ width: '12px', height: '12px' }}></div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>RED ELÉCTRICA SCADA</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>TELEMETRÍA EN VIVO</div>
          </div>
          <div className="scada-live-indicator" style={{ marginLeft: 'auto' }}>
            <div className="scada-live-dot"></div>
            LIVE
          </div>
        </div>

        {/* Quick stats */}
        <div className="scada-card" style={{ flex: '0 0 130px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#10b981' }}>{connectedCount}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Conectados</div>
        </div>
        <div className="scada-card" style={{ flex: '0 0 130px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>{disconnectedCount}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Desconectados</div>
        </div>
        <div className="scada-card" style={{ flex: '0 0 130px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: alarmCount > 0 ? '#ef4444' : '#10b981' }}>{alarmCount}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Alertas</div>
        </div>
        <div className="scada-card" style={{ flex: '0 0 130px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>{plcs.length}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>PLCs Activos</div>
        </div>
      </div>

      {/* MAIN TOPOLOGY SECTION */}
      <div className="scada-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div className="scada-header-glow" style={{ margin: 0, fontSize: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            TOPOLOGÍA DE RED ELÉCTRICA DE ALTA Y MEDIA TENSIÓN (SCADA + PLCs + BESS)
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={plcFilter === null ? '' : plcFilter}
              onChange={e => setPlcFilter(e.target.value ? Number(e.target.value) : null)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: '600'
              }}>
              <option value="">🌐 Todos los PLCs ({plcs.length})</option>
              {plcs.map(p => (
                <option key={p.id} value={p.id}>🎮 {p.nombre}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: '600'
              }}>
              <option value="ALL">⚡ Todos los Estados</option>
              <option value="CONECTADO">🟢 Conectados ({connectedCount})</option>
              <option value="DESCONECTADO">⚪ Desconectados ({disconnectedCount})</option>
              <option value="ALARMA">🔴 Alertas ({alarmCount})</option>
            </select>
          </div>
        </div>

        {/* TOPOLOGY SVG DIAGRAM */}
        <div style={{ position: 'relative', background: 'rgba(10,14,28,0.7)', borderRadius: '16px', border: '1px solid rgba(0,242,254,0.15)', overflow: 'hidden' }}>
          <svg viewBox="0 0 900 480" className="scada-map-svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="bessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid background mesh */}
            {Array.from({ length: 45 }, (_, i) => (
              <line key={`gv${i}`} x1={i * 20} y1="0" x2={i * 20} y2="480" stroke="rgba(0,242,254,0.025)" strokeWidth="1" />
            ))}
            {Array.from({ length: 24 }, (_, i) => (
              <line key={`gh${i}`} x1="0" y1={i * 20} x2="900" y2={i * 20} stroke="rgba(0,242,254,0.025)" strokeWidth="1" />
            ))}

            {/* LEVEL 1: HIGH VOLTAGE RED GRID INTAKE (Top Center) */}
            <g transform="translate(370, 20)">
              <rect x="0" y="0" width="160" height="48" rx="10" fill="rgba(0,242,254,0.12)" stroke="#00f2fe" strokeWidth="1.5" />
              <circle cx="20" cy="24" r="6" fill="#00f2fe" className="scada-status-ring" />
              <text x="90" y="20" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="Outfit">SUBESTACIÓN CENTRAL 400kV</text>
              <text x="90" y="36" textAnchor="middle" fill="#00f2fe" fontSize="8" fontWeight="600" fontFamily="Outfit">Red Transporte SCADA · 50.00 Hz</text>
            </g>

            {/* LEVEL 2: GENERATION & BESS STORAGE NODES */}
            {/* Solar PV Farm Node (Left) */}
            <g transform="translate(100, 90)">
              <line x1="350" y1="-22" x2="60" y2="0" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
              <rect x="0" y="0" width="130" height="42" rx="8" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="65" y="18" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="800" fontFamily="Outfit">☀️ PARQUE SOLAR ALFA</text>
              <text x="65" y="32" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="Outfit">Inyección Inversor +18.5 kW</text>
            </g>

            {/* BESS Battery Rack Node (Right) */}
            <g transform="translate(670, 90)">
              <line x1="-220" y1="-22" x2="65" y2="0" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
              <rect x="0" y="0" width="140" height="42" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="1.5" />
              <text x="70" y="18" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="800" fontFamily="Outfit">🔋 ALMACENAMIENTO BESS</text>
              <text x="70" y="32" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="Outfit">12 Módulos Litio · 85% SoC</text>
            </g>

            {/* LEVEL 3: INDUSTRIAL PLC CONTROL NODES (2 Rows of 4 PLCs) */}
            {plcs.map((plc, i) => {
              const isSelected = selectedPlcNode?.id === plc.id;
              const row = Math.floor(i / 4);
              const col = i % 4;
              const cx = 80 + col * 205;
              const cy = 180 + row * 110;
              const plcMeters = metersByPlc[plc.id] || [];
              const plcConnected = plcMeters.filter(m => m.estadoConexion === 'CONECTADO').length;
              const plcColor = plc.estado === 'ONLINE' || plc.estado === 'ACTIVO' ? '#10b981' : '#ef4444';

              return (
                <g key={plc.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPlcNode(plc)}>
                  {/* Connection lines from Subestación / BESS to PLC */}
                  <line x1="450" y1="68" x2={cx + 65} y2={cy} stroke="rgba(0,242,254,0.15)" strokeWidth="1" />
                  <line x1="450" y1="68" x2={cx + 65} y2={cy}
                    stroke={plcColor} strokeWidth="1.5" strokeDasharray="4 4"
                    style={{ animation: 'flow-pulse 2.5s linear infinite', opacity: 0.7 }} />

                  {/* PLC Node Card */}
                  <rect x={cx} y={cy} width="130" height="58" rx="8"
                    fill={isSelected ? 'rgba(0,242,254,0.2)' : 'rgba(15,23,42,0.92)'}
                    stroke={isSelected ? '#00f2fe' : plcColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'} />
                  
                  {/* Status Indicator Dot */}
                  <circle cx={cx + 14} cy={cy + 16} r="4" fill={plcColor} className={plc.estado === 'ONLINE' ? 'scada-status-ring' : ''} />
                  <text x={cx + 24} y={cy + 19} fill="#fff" fontSize="8.5" fontWeight="800" fontFamily="Outfit">
                    {plc.nombre.length > 17 ? plc.nombre.substring(0, 15) + '..' : plc.nombre}
                  </text>
                  <text x={cx + 14} y={cy + 34} fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="Outfit">{plc.ip}</text>
                  <text x={cx + 14} y={cy + 47} fill={plcColor} fontSize="7.5" fontWeight="700" fontFamily="Outfit">
                    ⚡ {plcConnected}/{plcMeters.length} Contadores
                  </text>

                  {/* LEVEL 4: SMART METERS CONNECTED TO THIS PLC */}
                  {plcMeters.slice(0, 6).map((m, mi) => {
                    const mx = cx + 8 + mi * 20;
                    const my = cy + 78;
                    const mColor = m.estadoConexion === 'CONECTADO' ? '#10b981' : 'rgba(255,255,255,0.2)';
                    const isMeterSelected = selectedMeter?.id === m.id;
                    return (
                      <g key={m.id} onClick={(e) => { e.stopPropagation(); setSelectedMeter(m); }}>
                        <line x1={cx + 65} y1={cy + 58} x2={mx} y2={my} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <circle cx={mx} cy={my} r={isMeterSelected ? "6" : "4.5"}
                          fill={mColor} stroke={isMeterSelected ? "#00f2fe" : "none"} strokeWidth="2"
                          style={{ transition: 'all 0.2s' }} />
                      </g>
                    );
                  })}
                  {plcMeters.length > 6 && (
                    <text x={cx + 128} y={cy + 81} fill="rgba(255,255,255,0.35)" fontSize="6.5" fontFamily="Outfit">+{plcMeters.length - 6}</text>
                  )}
                </g>
              );
            })}

            {/* LEVEL 5: END-USER CLIENT CATEGORIES (Bottom Row) */}
            <g transform="translate(40, 425)">
              <text x="0" y="0" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="700" fontFamily="Outfit">SISTEMAS CONECTADOS:</text>
              {[
                { icon: '🏭', name: 'Datacenter Cloud', color: '#00f2fe', x: 130 },
                { icon: '🏥', name: 'Hospital Central', color: '#ef4444', x: 280 },
                { icon: '🧪', name: 'Planta Química', color: '#a78bfa', x: 430 },
                { icon: '⚡', name: 'Red Electrolineras', color: '#10b981', x: 570 },
                { icon: '🏡', name: 'Residencial Norte', color: '#f59e0b', x: 720 },
              ].map(c => (
                <g key={c.name} transform={`translate(${c.x}, -10)`}>
                  <rect x="0" y="0" width="130" height="24" rx="6" fill="rgba(255,255,255,0.03)" stroke={`${c.color}33`} strokeWidth="1" />
                  <text x="12" y="16" fontSize="10">{c.icon}</text>
                  <text x="30" y="15" fill="#fff" fontSize="7.5" fontWeight="600" fontFamily="Outfit">{c.name}</text>
                </g>
              ))}
            </g>

            {/* Timestamp & SCADA Legend */}
            <g transform="translate(20, 465)">
              <circle cx="0" cy="0" r="4" fill="#10b981" />
              <text x="10" y="3" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Outfit">Conectado (Normal)</text>
              <circle cx="120" cy="0" r="4" fill="rgba(255,255,255,0.25)" />
              <text x="130" y="3" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Outfit">Desconectado</text>
              <circle cx="230" cy="0" r="4" fill="#ef4444" />
              <text x="240" y="3" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Outfit">Alarma Térmica/Voltaje</text>
            </g>
            <text x="880" y="468" textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Outfit">
              SCADA Engine · Polling 3s · Tick #{scadaTick}
            </text>
          </svg>
        </div>
      </div>

      {/* MAIN GRID: TELEMETRY GAUGES & DISTRIBUTION */}
      <div className="scada-container">
        {/* LIVE TELEMETRY GAUGES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          <div className="scada-card">
            <div className="scada-header-glow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              TELEMETRÍA AGREGADA EN TIEMPO REAL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', padding: '8px 0' }}>
              <ScadaGauge label="Voltaje Medio" value={avgVoltage} min={210} max={250} unit="V" color="#00f2fe" />
              <ScadaGauge label="Corriente Media" value={avgCurrent} min={0} max={30} unit="A" color="#f59e0b" />
              <ScadaGauge label="Potencia Total" value={totalPower} min={0} max={300} unit="kW" color="#10b981" />
              <ScadaGauge label="Frecuencia Red" value={avgFreq} min={49} max={51} unit="Hz" color="#a78bfa" />
            </div>
          </div>
        </div>

        {/* PLC CONTROL CARDS GRID */}
        <div style={{ flex: 1 }}>
          <div className="scada-card" style={{ height: '100%' }}>
            <div className="scada-header-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"></rect><rect x="2" y="14" width="20" height="8" rx="2"></rect></svg>
              CONTROLADORES INDUSTRIALES PLC ({plcs.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {plcs.map(plc => {
                const plcMeters = metersByPlc[plc.id] || [];
                const plcConnected = plcMeters.filter(m => m.estadoConexion === 'CONECTADO').length;
                const isRebooting = rebootingPlc === plc.id;
                const statusColor = plc.estado === 'ONLINE' || plc.estado === 'ACTIVO' ? '#10b981' : '#ef4444';
                return (
                  <div key={plc.id} style={{
                    background: 'rgba(255,255,255,0.02)', border: `1px solid ${statusColor}30`,
                    borderRadius: '10px', padding: '14px', position: 'relative', overflow: 'hidden',
                  }}>
                    {isRebooting && (
                      <div className="scada-reboot-overlay">
                        <div className="scada-spinner"></div>
                        Reiniciando...
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
                        {plc.nombre}
                      </div>
                      <span className={`badge ${plc.estado === 'ONLINE' || plc.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '9px' }}>
                        {plc.estado}
                      </span>
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>IP: {plc.ip}</div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handlePingPlc(plc.id)} style={{
                        flex: 1, padding: '5px', borderRadius: '6px', fontSize: '10px', fontWeight: '700',
                        background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.2)', color: '#00f2fe', cursor: 'pointer'
                      }}>⚡ PING</button>
                      <button onClick={() => handleRebootPlc(plc.id)} style={{
                        flex: 1, padding: '5px', borderRadius: '6px', fontSize: '10px', fontWeight: '700',
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', cursor: 'pointer'
                      }}>🔄 REBOOT</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SMART METERS GRID */}
      <div className="scada-card">
        <div className="scada-header-glow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"></rect><rect x="2" y="14" width="20" height="8" rx="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            RED DE CONTADORES INTELIGENTES ({filteredMedidores.length} de {medidores.length})
          </span>
          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.5)' }}></div>
              CONECTADO
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}></div>
              ALARMA
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}></div>
              OFF
            </span>
          </div>
        </div>
        <div className="scada-meter-grid">
          {filteredMedidores.map(m => {
            const isConnected = m.estadoConexion === 'CONECTADO';
            const isAlarm = isConnected && (m.voltaje || 0) > 238;
            const chipClass = isAlarm ? 'alarm' : isConnected ? 'connected' : 'disconnected';
            const chipNum = m.numeroSerie?.replace(/\D/g, '') || m.id.toString();
            return (
              <div
                key={m.id}
                className={`scada-meter-chip ${chipClass}`}
                title={`${m.numeroSerie} — ${m.cliente?.nombre || 'Sin cliente'} — ${m.estadoConexion || 'N/A'}`}
                onClick={() => setSelectedMeter(m)}
              >
                {chipNum.slice(-3)}
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORICAL ANALYTICS */}
      <ScadaAnalytics auth={auth} medidores={medidores} />

      {/* PLC NODE INSPECTOR SHEET */}
      {selectedPlcNode && (
        <>
          <div className="scada-overlay" onClick={() => setSelectedPlcNode(null)}></div>
          <div className="scada-detail-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>CONTROLADOR INDUSTRIAL PLC</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{selectedPlcNode.nombre}</div>
              </div>
              <button onClick={() => setSelectedPlcNode(null)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '14px', cursor: 'pointer',
              }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Dirección IP</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#00f2fe' }}>{selectedPlcNode.ip}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ubicación Física</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{selectedPlcNode.ubicacion}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => handlePingPlc(selectedPlcNode.id)} style={{
                flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(0,242,254,0.15)',
                border: '1px solid #00f2fe', color: '#00f2fe', fontWeight: '700', cursor: 'pointer'
              }}>⚡ Realizar PING Telemetría</button>
              <button onClick={() => handleRebootPlc(selectedPlcNode.id)} style={{
                flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)',
                border: '1px solid #f59e0b', color: '#f59e0b', fontWeight: '700', cursor: 'pointer'
              }}>🔄 Reiniciar Controlador</button>
            </div>
          </div>
        </>
      )}

      {/* METER DETAIL SLIDE PANEL */}
      {selectedMeter && (
        <>
          <div className="scada-overlay" onClick={() => setSelectedMeter(null)}></div>
          <div className="scada-detail-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>DETALLE CONTADOR INTELIGENTE</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{selectedMeter.numeroSerie}</div>
              </div>
              <button onClick={() => setSelectedMeter(null)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '14px', cursor: 'pointer',
              }}>✕</button>
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
              <span className={`badge ${selectedMeter.estadoConexion === 'CONECTADO' ? 'badge-success' : 'badge-warning'}`}>
                {selectedMeter.estadoConexion || 'N/A'}
              </span>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Cliente Suscriptor</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{selectedMeter.cliente?.nombre || '—'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>PLC Asociado</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#00f2fe' }}>{selectedMeter.plc?.nombre || 'Sin asignar'}</div>
              </div>
            </div>

            {/* Live Telemetry Gauges */}
            {selectedMeter.estadoConexion === 'CONECTADO' && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  ⚡ TELEMETRÍA EN VIVO DEL CONTADOR
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ScadaGauge label="Voltaje" value={selectedMeter.voltaje || 0} min={210} max={250} unit="V" color="#00f2fe" />
                  <ScadaGauge label="Corriente" value={selectedMeter.corriente || 0} min={0} max={30} unit="A" color="#f59e0b" />
                  <ScadaGauge label="Potencia" value={selectedMeter.potencia || 0} min={0} max={10} unit="kW" color="#10b981" />
                  <ScadaGauge label="Frecuencia" value={selectedMeter.frecuencia || 0} min={49} max={51} unit="Hz" color="#a78bfa" />
                </div>
              </div>
            )}

            {/* Connection Toggle */}
            <button
              onClick={() => handleToggleMeterConnection(selectedMeter)}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none', marginTop: '20px',
                background: selectedMeter.estadoConexion === 'CONECTADO'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.8), rgba(192,57,43,0.8))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(0,242,254,0.6))',
                color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.5px',
              }}
            >
              {selectedMeter.estadoConexion === 'CONECTADO' ? '⏻ DESCONECTAR CONTADOR' : '⏻ CONECTAR CONTADOR'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── BESS BATTERY MONITORING VIEW (Monitoreo de Baterías BESS en Tiempo Real) ─

function BessMonitoringView({ auth, t = (k: TranslationKey) => k }: { auth: AuthState; t?: (k: TranslationKey) => string }) {
  const [batteryHistory, setBatteryHistory] = useState<BateriaStatus[]>([]);
  const [, setLoading] = useState(true);
  const liveMode = true;
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [dbHistory, setDbHistory] = useState<BateriaStatus[]>([]);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [selectedBateriaId, setSelectedBateriaId] = useState<number>(0);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [activeUnitTab, setActiveUnitTab] = useState<number>(0);
  const [flowAngle, setFlowAngle] = useState<number>(0);

  // Animate energy flow
  useEffect(() => {
    const anim = setInterval(() => setFlowAngle(a => (a + 2) % 360), 50);
    return () => clearInterval(anim);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/baterias/status', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data: BateriaStatus[] = await res.json();
        if (data && data.length > 0) {
          setBatteryHistory(prev => {
            const ids = new Set(prev.map(p => p.id));
            const newItems = data.filter(d => !ids.has(d.id));
            const merged = [...newItems, ...prev].slice(0, 40);
            return merged;
          });
          setLastUpdate(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Error fetching BESS battery status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const queryStr = `days=${selectedDays}${selectedBateriaId > 0 ? `&bateriaId=${selectedBateriaId}` : ''}`;
      const res = await fetch(`/api/baterias/history?${queryStr}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data: BateriaStatus[] = await res.json();
        setDbHistory(data);
      }
    } catch (err) {
      console.warn('Error fetching BESS DB history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleBateriaModo = async (bateriaId: number, modo: string) => {
    try {
      await fetch(`/api/baterias/${bateriaId}/modo?modo=${modo}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      fetchStatus();
    } catch (err) {
      console.warn('Error setting BESS mode:', err);
    }
  };

  const togglePuntoConexionPermisos = async (bateriaId: number, permiteCargar: boolean, permiteSuministrar: boolean) => {
    try {
      await fetch(`/api/baterias/${bateriaId}/punto-conexion?permiteCargar=${permiteCargar}&permiteSuministrar=${permiteSuministrar}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      fetchStatus();
    } catch (err) {
      console.warn('Error toggling PuntoConexion:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (liveMode) fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [auth, liveMode]);

  useEffect(() => { fetchHistory(); }, [auth, selectedDays, selectedBateriaId]);

  const latest = batteryHistory[0] || {
    id: 1, bateriaId: 1, flowState: 'SUMINISTRANDO', voltage: 400.0, current: 185.0,
    frequency: 50.0, power: 74.0, soc: 82.5, temperature: 26.5, durationSeconds: 7800,
    esHoraValle: false, permiteCargar: true, permiteSuministrar: true,
    puntoConexionNombre: 'Subestación Alpha 220kV - Bi-direccional', timestamp: new Date().toISOString()
  };

  const formatSecs = (sec?: number) => {
    if (!sec || sec <= 0) return '0s';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const powerkW = (latest.power || (latest.voltage * latest.current * 1.732 / 1000)).toFixed(1);
  const socEst = latest.soc || Math.min(100, Math.max(0, Math.round(((latest.voltage - 44.0) / 12) * 100)));
  const tempColor = latest.temperature > 35 ? '#ef4444' : latest.temperature > 28 ? '#f59e0b' : '#10b981';

  // Per-unit aggregated stats from DB history
  const unitStats = [1, 2, 3].map(uid => {
    const uRec = dbHistory.filter(h => h.bateriaId === uid);
    const latest_ = uRec[uRec.length - 1] || null;
    const flowState = latest_?.flowState || (uid === 1 ? 'SUMINISTRANDO' : uid === 2 ? 'CARGANDO' : 'STANDBY');
    const frequency = latest_?.frequency || 50.0;
    const duration = latest_?.durationSeconds || (uid * 3600 + 1200);
    const pCargar = latest_?.permiteCargar ?? true;
    const pSuministrar = latest_?.permiteSuministrar ?? true;

    if (!uRec.length) {
      return {
        id: uid, soc: 80, voltage: '400.0', current: '150.0', frequency: 50.0,
        temp: '25.0', power: '70.0', health: 95, flowState, duration, pCargar, pSuministrar, latest: null
      };
    }
    const avgV = uRec.reduce((s, r) => s + r.voltage, 0) / uRec.length;
    const avgI = uRec.reduce((s, r) => s + r.current, 0) / uRec.length;
    const avgT = uRec.reduce((s, r) => s + r.temperature, 0) / uRec.length;
    const soc = latest_?.soc || Math.min(100, Math.max(0, Math.round(((avgV - 44) / 12) * 100)));
    const power = (avgV * avgI * 1.732) / 1000;
    const health = Math.min(100, Math.round(((soc / 100) * 0.4 + ((50 - Math.min(50, avgT)) / 50) * 0.3 + 0.3) * 100));
    return {
      id: uid, soc, voltage: avgV.toFixed(1), current: avgI.toFixed(1), frequency: frequency.toFixed(2),
      temp: avgT.toFixed(1), power: power.toFixed(1), health, flowState, duration, pCargar, pSuministrar, latest: latest_
    };
  });

  // SVG mini-chart helper
  const MiniChart = ({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) => {
    if (data.length < 2) return <div style={{ height: `${height}px` }} />;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const W = 100, H = height;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`).join(' ');
    const area = `0,${H} ${pts} ${W},${H}`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`mg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#mg-${color.replace('#','')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
    );
  };

  // Circular gauge
  const GaugeRing = ({ pct, color, size = 110, label, value, unit }: { pct: number; color: string; size?: number; label: string; value: string; unit: string }) => {
    const r = size * 0.38, cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <svg width={size} height={size} style={{ overflow: 'visible', filter: `drop-shadow(0 0 10px ${color}55)` }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize={size * 0.18} fontWeight="800" fontFamily="Outfit">{value}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size * 0.1} fontFamily="Outfit">{unit}</text>
        </svg>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      </div>
    );
  };

  // Helper to sample DB data for a specific bateria and metric
  const getSampledSeries = (bId: number | null, metric: string, maxPts = 40) => {
    const src = bId ? dbHistory.filter(h => h.bateriaId === bId) : dbHistory;
    const sampleRate = Math.max(1, Math.floor(src.length / maxPts));
    const sampled = src.filter((_, i) => i % sampleRate === 0);
    return sampled.map(h => {
      if (metric === 'voltage') return h.voltage;
      if (metric === 'current') return h.current;
      if (metric === 'frequency') return h.frequency || 50.0;
      if (metric === 'temperature') return h.temperature;
      if (metric === 'soc') return h.soc || Math.min(100, Math.max(0, Math.round(((h.voltage - 44) / 12) * 100)));
      return (h.voltage * h.current * 1.732) / 1000;
    });
  };

  const modules = Array.from({ length: 12 }, (_, i) => {
    const v = latest.voltage - (i * 1.3) % 5;
    const t = latest.temperature + (i % 3) * 1.2;
    return { id: i + 1, voltage: v.toFixed(1), temp: t.toFixed(1), status: t > 35 ? 'critical' : t > 29 ? 'warn' : 'ok' };
  });

  const unitNames = ['', 'BESS-01 Subestación', 'BESS-02 Fotovoltaico', 'BESS-03 Industrial'];
  const unitColors = ['', '#00f2fe', '#10b981', '#a78bfa'];
  const unitIcons = ['', '🏭', '☀️', '⚙️'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '260px', border: '1px solid rgba(0,242,254,0.15)' }}>
        <img src="/bess_rack.png" alt="BESS Battery Rack" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,14,28,0.96) 0%, rgba(10,14,28,0.85) 60%, rgba(10,14,28,0.4) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <div style={{
              background: latest.flowState === 'CARGANDO' ? 'linear-gradient(135deg, #00f2fe, #3b82f6)' :
                          latest.flowState === 'SUMINISTRANDO' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#fff',
              boxShadow: `0 0 12px ${latest.flowState === 'CARGANDO' ? '#00f2fe88' : '#10b98188'}`
            }}>
              {latest.flowState === 'CARGANDO' ? '🔋 RECIBIENDO ENERGÍA (CARGANDO)' :
               latest.flowState === 'SUMINISTRANDO' ? '⚡ SUMINISTRANDO ENERGÍA (DESCARGANDO)' : '⏸️ STANDBY / REPOSO'}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
              ⏱️ TIEMPO EN ESTADO: <strong style={{ color: '#00f2fe' }}>{formatSecs(latest.durationSeconds)}</strong>
            </div>

            <div style={{ background: latest.esHoraValle ? 'rgba(0,242,254,0.15)' : 'rgba(255,171,0,0.15)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: latest.esHoraValle ? '#00f2fe' : '#ffab00', border: `1px solid ${latest.esHoraValle ? '#00f2fe' : '#ffab00'}` }}>
              {latest.esHoraValle ? '🌙 HORA VALLE ACTIVA (00:00-08:00)' : '☀️ HORA PICO / LLANO'}
            </div>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 6px 0', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            Baterías BESS — <span style={{ background: 'linear-gradient(to right, #00f2fe, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Control Bi-direccional de Carga y Suministro</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: '0 0 14px 0' }}>
            {latest.puntoConexionNombre} · Permisos de Punto de Conexión: Suministrar [{latest.permiteSuministrar ? '✓' : '✗'}] | Cargar [{latest.permiteCargar ? '✓' : '✗'}]
          </p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { l: 'Flujo Actual', v: latest.flowState || 'SUMINISTRANDO', c: latest.flowState === 'CARGANDO' ? '#00f2fe' : '#10b981' },
              { l: 'Amperaje (Corriente)', v: `${(latest.current || 180).toFixed(1)} A`, c: '#f59e0b' },
              { l: 'Voltaje (AC/DC)', v: `${(latest.voltage || 400).toFixed(1)} V`, c: '#00f2fe' },
              { l: 'Frecuencia Red', v: `${(latest.frequency || 50.0).toFixed(2)} Hz`, c: '#a78bfa' },
              { l: 'Potencia Activa', v: `${powerkW} kW`, c: '#10b981' },
              { l: 'Tiempo Activo', v: formatSecs(latest.durationSeconds), c: '#3b82f6' }
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: c, marginTop: '2px' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PER-UNIT BESS CARDS WITH STATE & CONTROLS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {unitStats.map(u => {
          const c = unitColors[u.id];
          const isActive = activeUnitTab === u.id;
          const isCharging = u.flowState === 'CARGANDO';
          const isDischarging = u.flowState === 'SUMINISTRANDO';

          return (
            <div key={u.id}
              style={{
                background: isActive ? `${c}18` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? c : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '16px', padding: '20px', transition: 'all 0.3s',
                boxShadow: isActive ? `0 0 24px ${c}33` : 'none'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{unitIcons[u.id]} Unidad BESS #{u.id}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: c, marginTop: '2px' }}>{unitNames[u.id]}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                    background: isCharging ? 'rgba(0,242,254,0.2)' : isDischarging ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                    color: isCharging ? '#00f2fe' : isDischarging ? '#10b981' : '#f59e0b',
                    border: `1px solid ${isCharging ? '#00f2fe' : isDischarging ? '#10b981' : '#f59e0b'}`
                  }}>
                    {isCharging ? '🔋 CARGANDO' : isDischarging ? '⚡ SUMINISTRANDO' : '⏸️ STANDBY'}
                  </span>
                </div>
              </div>

              {/* Primary Telemetry Values */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>⚡ Amperaje (A)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b' }}>{u.current} A</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>〰️ Frecuencia (Hz)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#a78bfa' }}>{u.frequency} Hz</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>🔌 Voltaje (V)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#00f2fe' }}>{u.voltage} V</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>⏱️ Tiempo en Estado</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>{formatSecs(u.duration)}</div>
                </div>
              </div>

              {/* SoC bar */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Estado de Carga (SoC)</span>
                  <span style={{ color: c, fontWeight: '700' }}>{u.soc}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${u.soc}%`, background: `linear-gradient(90deg, ${c}, ${c}99)`, borderRadius: '3px', boxShadow: `0 0 8px ${c}88`, transition: 'width 1s ease' }} />
                </div>
              </div>

              {/* Connection Point Controls */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  🔌 Punto de Conexión: Suministrar & Carga
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => togglePuntoConexionPermisos(u.id, !u.pCargar, u.pSuministrar)}
                    style={{
                      flex: 1, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer',
                      background: u.pCargar ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)',
                      color: u.pCargar ? '#00f2fe' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${u.pCargar ? '#00f2fe44' : 'rgba(255,255,255,0.1)'}`
                    }}>
                    Cargar {u.pCargar ? '✓' : '✗'}
                  </button>
                  <button onClick={() => togglePuntoConexionPermisos(u.id, u.pCargar, !u.pSuministrar)}
                    style={{
                      flex: 1, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer',
                      background: u.pSuministrar ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      color: u.pSuministrar ? '#10b981' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${u.pSuministrar ? '#10b98144' : 'rgba(255,255,255,0.1)'}`
                    }}>
                    Suministrar {u.pSuministrar ? '✓' : '✗'}
                  </button>
                </div>
              </div>

              {/* Operating Mode Manual Override */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => toggleBateriaModo(u.id, 'SUMINISTRANDO')}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', border: 'none',
                    background: isDischarging ? '#10b981' : 'rgba(255,255,255,0.05)',
                    color: isDischarging ? '#fff' : 'rgba(255,255,255,0.5)'
                  }}>⚡ Suministrar</button>

                <button onClick={() => toggleBateriaModo(u.id, 'CARGANDO')}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', border: 'none',
                    background: isCharging ? '#00f2fe' : 'rgba(255,255,255,0.05)',
                    color: isCharging ? '#000' : 'rgba(255,255,255,0.5)'
                  }}>🔋 Cargar Valle</button>

                <button onClick={() => toggleBateriaModo(u.id, 'STANDBY')}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', border: 'none',
                    background: u.flowState === 'STANDBY' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: u.flowState === 'STANDBY' ? '#000' : 'rgba(255,255,255,0.5)'
                  }}>⏸️ Standby</button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── ANIMATED ENERGY FLOW + GAUGES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Energy Flow Diagram */}
        <div className="scada-card" style={{ padding: '24px' }}>
          <div className="scada-header-glow" style={{ marginBottom: '20px' }}>⚡ DIAGRAMA DE FLUJO DE ENERGÍA (HORA VALLE / PICO)</div>
          <svg viewBox="0 0 300 200" style={{ width: '100%', height: '200px' }}>
            <defs>
              <radialGradient id="solarGrad"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3"/></radialGradient>
              <radialGradient id="gridGrad"><stop offset="0%" stopColor="#00f2fe" stopOpacity="0.9"/><stop offset="100%" stopColor="#00f2fe" stopOpacity="0.2"/></radialGradient>
              <radialGradient id="bessGrad"><stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/><stop offset="100%" stopColor="#10b981" stopOpacity="0.2"/></radialGradient>
              <radialGradient id="loadGrad"><stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2"/></radialGradient>
            </defs>

            {/* Connecting lines with animated dashes */}
            <line x1="80" y1="45" x2="150" y2="100" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" strokeDashoffset={-flowAngle % 20} style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
            <line x1="220" y1="45" x2="150" y2="100" stroke="#00f2fe" strokeWidth="2" strokeDasharray="6 4" strokeDashoffset={latest.flowState === 'CARGANDO' ? flowAngle % 20 : -flowAngle % 20} style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
            <line x1="150" y1="100" x2="80" y2="160" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" strokeDashoffset={flowAngle % 20} style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
            <line x1="150" y1="100" x2="220" y2="160" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 4" strokeDashoffset={flowAngle % 20} style={{ transition: 'stroke-dashoffset 0.05s linear' }} />

            {/* Solar PV node */}
            <circle cx="80" cy="40" r="26" fill="url(#solarGrad)" opacity="0.8" />
            <text x="80" y="35" textAnchor="middle" fill="#fff" fontSize="14">☀️</text>
            <text x="80" y="50" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">SOLAR PV</text>
            <text x="80" y="60" textAnchor="middle" fill="#fbbf24" fontSize="7">+18 kW</text>

            {/* Grid node */}
            <circle cx="220" cy="40" r="26" fill="url(#gridGrad)" opacity="0.8" />
            <text x="220" y="35" textAnchor="middle" fill="#fff" fontSize="14">🔌</text>
            <text x="220" y="50" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">RED ELÉCTRICA</text>
            <text x="220" y="60" textAnchor="middle" fill="#00f2fe" fontSize="7">50.0 Hz</text>

            {/* BESS central node */}
            <circle cx="150" cy="100" r="32" fill="url(#bessGrad)" opacity="0.9" />
            <text x="150" y="93" textAnchor="middle" fill="#fff" fontSize="16">🔋</text>
            <text x="150" y="108" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="800">BESS BATERÍA</text>
            <text x="150" y="118" textAnchor="middle" fill="#10b981" fontSize="7">{socEst}% SOC</text>

            {/* Load node */}
            <circle cx="80" cy="165" r="24" fill="url(#loadGrad)" opacity="0.8" />
            <text x="80" y="160" textAnchor="middle" fill="#fff" fontSize="12">🏭</text>
            <text x="80" y="173" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">CARGA</text>

            {/* Export node */}
            <circle cx="220" cy="165" r="24" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth="1" opacity="0.8" />
            <text x="220" y="160" textAnchor="middle" fill="#fff" fontSize="12">📡</text>
            <text x="220" y="173" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">INYECCIÓN</text>

            {/* Power value label */}
            <rect x="110" y="68" width="80" height="18" rx="6" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
            <text x="150" y="81" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="700">{powerkW} kW activos</text>
          </svg>
        </div>

        {/* Live Gauges Grid */}
        <div className="scada-card" style={{ padding: '24px' }}>
          <div className="scada-header-glow" style={{ marginBottom: '16px' }}>🎯 LECTURAS EN VIVO — UNIDAD ACTIVA</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <GaugeRing pct={socEst} color="#10b981" size={110} label="SoC Carga" value={`${socEst}`} unit="%" />
            <GaugeRing pct={Math.min(100, ((latest.voltage || 400) / 450) * 100)} color="#00f2fe" size={110} label="Voltaje" value={(latest.voltage || 400).toFixed(1)} unit="V" />
            <GaugeRing pct={Math.min(100, ((latest.current || 180) / 250) * 100)} color="#f59e0b" size={110} label="Amperaje" value={(latest.current || 180).toFixed(1)} unit="A" />
            <GaugeRing pct={Math.min(100, ((latest.frequency || 50) / 60) * 100)} color="#a78bfa" size={110} label="Frecuencia" value={(latest.frequency || 50.0).toFixed(2)} unit="Hz" />
          </div>
        </div>
      </div>

      {/* ── 4-PANEL SIMULTANEOUS CHARTS ── */}
      <div className="scada-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="scada-header-glow" style={{ margin: 0 }}>📊 ANÁLISIS MULTIVARIABLE — DATOS ORACLE DB</div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Amperaje, Frecuencia (Hz), Voltaje y Potencia · {dbHistory.length} registros</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{l:'24h',d:1},{l:'7d',d:7},{l:'30d',d:30},{l:'60d',d:60}].map(o => (
              <button key={o.d} onClick={() => setSelectedDays(o.d)} style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', border: 'none',
                background: selectedDays === o.d ? 'linear-gradient(135deg, #00f2fe, #7000ff)' : 'rgba(255,255,255,0.05)',
                color: selectedDays === o.d ? '#fff' : 'rgba(255,255,255,0.5)',
                boxShadow: selectedDays === o.d ? '0 0 12px rgba(0,242,254,0.4)' : 'none'
              }}>{o.l}</button>
            ))}
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            {[{id:0,l:'Todas'},{id:1,l:'BESS-01'},{id:2,l:'BESS-02'},{id:3,l:'BESS-03'}].map(b => (
              <button key={b.id} onClick={() => setSelectedBateriaId(b.id)} style={{
                padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                background: selectedBateriaId === b.id ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedBateriaId === b.id ? '#00f2fe' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${selectedBateriaId === b.id ? '#00f2fe' : 'rgba(255,255,255,0.08)'}`
              }}>{b.l}</button>
            ))}
          </div>
        </div>

        {loadingHistory ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>⏳ Cargando datos Oracle DB...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { metric: 'current', label: '⚡ Amperaje / Corriente (A)', color: '#f59e0b', unit: 'A' },
              { metric: 'frequency', label: '〰️ Frecuencia de Red (Hz)', color: '#a78bfa', unit: 'Hz' },
              { metric: 'voltage', label: '🔌 Voltaje de Pack (V)', color: '#00f2fe', unit: 'V' },
              { metric: 'power', label: '💡 Potencia Activa (kW)', color: '#10b981', unit: 'kW' },
            ].map(({ metric, label, color, unit }) => {
              const bId = selectedBateriaId > 0 ? selectedBateriaId : null;
              const src = bId ? dbHistory.filter(h => h.bateriaId === bId) : dbHistory;
              const sampleRate = Math.max(1, Math.floor(src.length / 50));
              const sampled = src.filter((_, i) => i % sampleRate === 0);
              const values = sampled.map(h => {
                if (metric === 'voltage') return h.voltage;
                if (metric === 'current') return h.current;
                if (metric === 'frequency') return h.frequency || 50.0;
                if (metric === 'temperature') return h.temperature;
                return (h.voltage * h.current * 1.732) / 1000;
              });
              if (!values.length) return (
                <div key={metric} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Sin datos</span>
                </div>
              );
              const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
              const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
              const W = 400, H = 80;
              const pts = sampled.map((_, i) => { const x = (i / (sampled.length - 1 || 1)) * W; const y = H - 8 - ((values[i] - min) / range) * (H - 16); return `${x.toFixed(1)},${y.toFixed(1)}`; });
              const polyStr = pts.join(' ');
              const areaStr = `0,${H} ${polyStr} ${W},${H}`;
              return (
                <div key={metric} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: `1px solid ${color}22` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color, fontWeight: '700' }}>{label}</span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ø <span style={{ color }}>{avg}{unit}</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>↑ <span style={{ color: '#10b981' }}>{max.toFixed(1)}</span></span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>↓ <span style={{ color: '#f59e0b' }}>{min.toFixed(1)}</span></span>
                    </div>
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id={`ag-${metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0.25, 0.5, 0.75].map((r, i) => (
                      <line key={i} x1="0" y1={H - 8 - r * (H - 16)} x2={W} y2={H - 8 - r * (H - 16)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    ))}
                    <polygon points={areaStr} fill={`url(#ag-${metric})`} />
                    <polyline points={polyStr} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── LIVE TELEMETRY TABLE WITH BESS MODES & TIMERS ── */}
      <div className="scada-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="scada-header-glow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            TELEMETRÍA BESS EN VIVO — REGISTRO DE SUMINISTRO Y CARGA VALLE
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Polling 3s · Oracle DB</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Unidad BESS</th>
                <th>Modo / Flujo</th>
                <th>Tiempo Transcurrido</th>
                <th>Amperaje (A)</th>
                <th>Frecuencia (Hz)</th>
                <th>Voltaje (V)</th>
                <th>Potencia (kW)</th>
                <th>SoC Carga</th>
                <th>Punto Conexión</th>
              </tr>
            </thead>
            <tbody>
              {batteryHistory.map((item, idx) => {
                const isLatest = idx === 0;
                const uColor = unitColors[item.bateriaId] || '#ffffff';
                const mode = item.flowState || (item.bateriaId === 1 ? 'SUMINISTRANDO' : item.bateriaId === 2 ? 'CARGANDO' : 'STANDBY');
                const isChg = mode === 'CARGANDO';
                const isDis = mode === 'SUMINISTRANDO';

                return (
                  <tr key={item.id || idx} style={{ background: isLatest ? 'rgba(0,242,254,0.04)' : 'transparent' }}>
                    <td style={{ fontWeight: '700', color: isLatest ? '#00f2fe' : '#fff' }}>#{item.id || idx + 1}</td>
                    <td>{new Date(item.timestamp).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' })}</td>
                    <td><span style={{ color: uColor, fontWeight: '700', fontSize: '11px' }}>{unitNames[item.bateriaId] || `BESS-${item.bateriaId}`}</span></td>

                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                        background: isChg ? 'rgba(0,242,254,0.2)' : isDis ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                        color: isChg ? '#00f2fe' : isDis ? '#10b981' : '#f59e0b',
                        border: `1px solid ${isChg ? '#00f2fe' : isDis ? '#10b981' : '#f59e0b'}`
                      }}>
                        {isChg ? '🔋 CARGANDO (VALLE)' : isDis ? '⚡ SUMINISTRANDO' : '⏸️ STANDBY'}
                      </span>
                    </td>

                    <td style={{ color: '#00f2fe', fontWeight: '700' }}>{formatSecs(item.durationSeconds)}</td>
                    <td style={{ color: '#f59e0b', fontWeight: '700' }}>{item.current.toFixed(1)} A</td>
                    <td style={{ color: '#a78bfa', fontWeight: '700' }}>{(item.frequency || 50.0).toFixed(2)} Hz</td>
                    <td style={{ color: '#00f2fe', fontWeight: '600' }}>{item.voltage.toFixed(1)} V</td>
                    <td style={{ color: '#10b981', fontWeight: '600' }}>{(item.power || ((item.voltage * item.current * 1.732)/1000)).toFixed(1)} kW</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '48px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${item.soc || 80}%`, background: '#10b981', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>{item.soc || 80}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                        Sum: [{item.permiteSuministrar ?? true ? '✓' : '✗'}] | Car: [{item.permiteCargar ?? true ? '✓' : '✗'}]
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ─── SCADA ANALYTICS — Gráficos Dinámicos ─────────────────────────────────────

interface AnalyticsPoint {
  fecha: string;
  avgVoltaje: number;
  avgCorriente: number;
  sumPotencia: number;
  avgFrecuencia: number;
  sumConsumo: number;
  medidoresActivos: number;
}

interface TopConsumidor {
  medidorId: number;
  numeroSerie: string;
  plcNombre: string;
  totalConsumo: number;
}

// ─── SVG Line/Area Chart ─────────────────────────────────────────────────────
function SvgLineChart({ data, valueKey, color, label, unit, filled = false }: {
  data: AnalyticsPoint[];
  valueKey: keyof AnalyticsPoint;
  color: string;
  label: string;
  unit: string;
  filled?: boolean;
}) {
  const W = 400, H = 120, PAD = { top: 16, right: 8, bottom: 28, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  if (!data.length) return (
    <div style={{ width: '100%', height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
      Sin datos
    </div>
  );

  const values = data.map(d => Number(d[valueKey]));
  const minV = Math.min(...values) * 0.98;
  const maxV = Math.max(...values) * 1.02;
  const range = maxV - minV || 1;

  const xScale = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) => PAD.top + chartH - ((v - minV) / range) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(Number(d[valueKey]))}`).join(' ');
  const areaPath = `M ${xScale(0)},${PAD.top + chartH} ` +
    data.map((d, i) => `L ${xScale(i)},${yScale(Number(d[valueKey]))}`).join(' ') +
    ` L ${xScale(data.length - 1)},${PAD.top + chartH} Z`;

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PAD.left - 4} y={yScale(v) + 4} textAnchor="end"
              fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="Outfit">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {/* X-axis dates — show first, middle, last */}
        {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
          data[i] ? (
            <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle"
              fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="Outfit">
              {data[i].fecha.slice(5)}
            </text>
          ) : null
        ))}
        {/* Area fill */}
        {filled && (
          <path d={areaPath} fill={color} opacity="0.08" />
        )}
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        {/* Dots */}
        {data.length <= 15 && data.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(Number(d[valueKey]))} r="2.5"
            fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
            <title>{data[i].fecha}: {Number(d[valueKey]).toFixed(2)} {unit}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function SvgBarChart({ data, valueKey, color, label, unit }: {
  data: AnalyticsPoint[];
  valueKey: keyof AnalyticsPoint;
  color: string;
  label: string;
  unit: string;
}) {
  const W = 400, H = 120, PAD = { top: 16, right: 8, bottom: 28, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  if (!data.length) return null;

  const values = data.map(d => Number(d[valueKey]));
  const maxV = Math.max(...values) * 1.1 || 1;
  const barW = Math.max(2, chartW / data.length - 2);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        {[0, 0.5, 1].map((pct, i) => {
          const y = PAD.top + chartH - pct * chartH;
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end"
                fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="Outfit">
                {(maxV * pct / 1.1).toFixed(0)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const v = Number(d[valueKey]);
          const barH = (v / maxV) * chartH;
          const x = PAD.left + (i / data.length) * chartW + 1;
          const y = PAD.top + chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={color} opacity="0.7" rx="1"
                style={{ filter: `drop-shadow(0 0 3px ${color}50)` }}>
                <title>{d.fecha}: {v.toFixed(2)} {unit}</title>
              </rect>
            </g>
          );
        })}
        {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
          data[i] ? (
            <text key={i} x={PAD.left + (i / data.length) * chartW + barW / 2}
              y={H - 4} textAnchor="middle"
              fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="Outfit">
              {data[i].fecha.slice(5)}
            </text>
          ) : null
        ))}
      </svg>
    </div>
  );
}

// ─── SVG Horizontal Bar Chart (Top Consumers) ────────────────────────────────
function SvgHBarChart({ data }: { data: TopConsumidor[] }) {
  const maxV = Math.max(...data.map(d => d.totalConsumo), 1);
  const colors = ['#00f2fe', '#f59e0b', '#10b981', '#a78bfa', '#ef4444',
                  '#06b6d4', '#f97316', '#22c55e', '#8b5cf6', '#ec4899'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {data.map((d, i) => {
        const pct = (d.totalConsumo / maxV) * 100;
        const c = colors[i % colors.length];
        return (
          <div key={d.medidorId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '80px', fontSize: '10px', color: 'rgba(255,255,255,0.6)', textAlign: 'right',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
              {d.numeroSerie}
            </div>
            <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: c,
                borderRadius: '4px', boxShadow: `0 0 6px ${c}60`,
                transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ width: '60px', fontSize: '10px', color: c, fontWeight: '700',
              fontVariantNumeric: 'tabular-nums', textAlign: 'right', flexShrink: 0 }}>
              {d.totalConsumo.toFixed(1)} kWh
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
function SvgDonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const R = 40, cx = 60, cy = 60, stroke = 16;
  let cumAngle = -Math.PI / 2;

  const arcs = slices.map(slice => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cumAngle);
    const y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle);
    const y2 = cy + R * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return { ...slice, path: `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`, angle };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg viewBox="0 0 120 120" style={{ width: '100px', flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          arc.angle > 0.01 ? (
            <path key={i} d={arc.path} fill="none" stroke={arc.color}
              strokeWidth={stroke} strokeLinecap="butt"
              style={{ filter: `drop-shadow(0 0 4px ${arc.color}60)` }}>
              <title>{arc.label}: {arc.value} ({((arc.value / total) * 100).toFixed(0)}%)</title>
            </path>
          ) : null
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="12"
          fontWeight="800" fontFamily="Outfit">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)"
          fontSize="7" fontFamily="Outfit">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px',
              background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: '700', marginLeft: 'auto' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Analytics Component ─────────────────────────────────────────────────
function ScadaAnalytics({ auth, medidores }: { auth: AuthState; medidores: Medidor[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [plcId, setPlcId] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState(monthAgo);
  const [fechaFin, setFechaFin] = useState(today);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPoint[]>([]);
  const [topData, setTopData] = useState<TopConsumidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [plcs, setPlcs] = useState<Plc[]>([]);

  const headers = { 'Authorization': `Bearer ${auth.token}` };
  const API_BASE = '/api';

  useEffect(() => {
    fetch(`${API_BASE}/plcs`, { headers }).then(r => r.ok ? r.json() : []).then(setPlcs).catch(() => {});
    loadData();
  }, []);

  useEffect(() => {
    if (!liveMode) return;
    const t = setInterval(loadData, 10000);
    return () => clearInterval(t);
  }, [liveMode, plcId, fechaInicio, fechaFin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (plcId) params.set('plcId', plcId);
      if (fechaInicio) params.set('fechaInicio', fechaInicio);
      if (fechaFin) params.set('fechaFin', fechaFin);

      const [ana, top] = await Promise.all([
        fetch(`${API_BASE}/lecturas/analytics?${params}`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/lecturas/top-consumidores?${params}&top=10`, { headers }).then(r => r.ok ? r.json() : []),
      ]);
      setAnalyticsData(ana);
      setTopData(top);
    } catch { /* noop */ }
    setLoading(false);
  };

  // Derived stats for donut
  const connected = medidores.filter(m => plcId ? String(m.plc?.id) === plcId : true)
    .filter(m => m.estadoConexion === 'CONECTADO').length;
  const alarm = medidores.filter(m => plcId ? String(m.plc?.id) === plcId : true)
    .filter(m => m.estadoConexion === 'CONECTADO' && (m.voltaje || 0) > 238).length;
  const offline = medidores.filter(m => plcId ? String(m.plc?.id) === plcId : true)
    .filter(m => m.estadoConexion !== 'CONECTADO').length;

  return (
    <div className="scada-card" style={{ marginTop: '0' }}>
      {/* ── Header + Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="scada-header-glow" style={{ margin: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          ANÁLISIS HISTÓRICO
          {liveMode && <span className="scada-live-indicator" style={{ marginLeft: '10px' }}>
            <div className="scada-live-dot"></div>LIVE
          </span>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* PLC selector */}
          <select value={plcId} onChange={e => setPlcId(e.target.value)}
            style={{
              background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: '8px', color: '#fff', padding: '8px 12px', fontSize: '12px',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}>
            <option value="">🌐 Global (todos los PLCs)</option>
            {plcs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>

          {/* Date range */}
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '12px',
              fontFamily: 'inherit', outline: 'none',
            }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>→</span>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '12px',
              fontFamily: 'inherit', outline: 'none',
            }} />

          {/* Apply button */}
          <button onClick={loadData} disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0,242,254,0.8), rgba(112,0,255,0.6))',
              color: '#fff', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1, transition: 'all 0.2s ease',
            }}>
            {loading ? '⟳' : '▶ APLICAR'}
          </button>

          {/* Live toggle */}
          <button onClick={() => setLiveMode(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              background: liveMode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
              border: liveMode ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: liveMode ? '#10b981' : 'rgba(255,255,255,0.4)',
              fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.2s ease',
            }}>
            ⟳ LIVE
          </button>
        </div>
      </div>

      {/* ── Summary row ── */}
      {analyticsData.length > 0 && (() => {
        const totalConsumo = analyticsData.reduce((s, d) => s + d.sumConsumo, 0);
        const avgV = analyticsData.reduce((s, d) => s + d.avgVoltaje, 0) / analyticsData.length;
        const avgC = analyticsData.reduce((s, d) => s + d.avgCorriente, 0) / analyticsData.length;
        const avgP = analyticsData.reduce((s, d) => s + d.sumPotencia, 0) / analyticsData.length;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Consumo Total', value: `${totalConsumo.toFixed(0)} kWh`, color: '#10b981' },
              { label: 'Voltaje Medio', value: `${avgV.toFixed(1)} V`, color: '#00f2fe' },
              { label: 'Corriente Media', value: `${avgC.toFixed(2)} A`, color: '#f59e0b' },
              { label: 'Potencia Media', value: `${avgP.toFixed(1)} kW`, color: '#a78bfa' },
              { label: 'Días analizados', value: `${analyticsData.length}`, color: 'rgba(255,255,255,0.5)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                border: `1px solid ${s.color}20`, padding: '12px 14px',
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Main Charts 2x2 grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(0,242,254,0.08)' }}>
          <SvgLineChart data={analyticsData} valueKey="avgVoltaje" color="#00f2fe" label="Voltaje Medio (V)" unit="V" />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(245,158,11,0.08)' }}>
          <SvgLineChart data={analyticsData} valueKey="avgCorriente" color="#f59e0b" label="Corriente Media (A)" unit="A" />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(167,139,250,0.08)' }}>
          <SvgLineChart data={analyticsData} valueKey="avgFrecuencia" color="#a78bfa" label="Frecuencia Media (Hz)" unit="Hz" />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16,185,129,0.08)' }}>
          <SvgBarChart data={analyticsData} valueKey="sumConsumo" color="#10b981" label="Consumo Diario (kWh)" unit="kWh" />
        </div>
      </div>

      {/* ── Potencia + Top + Donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(239,68,68,0.08)', gridColumn: 'span 1' }}>
          <SvgLineChart data={analyticsData} valueKey="sumPotencia" color="#ef4444" label="Potencia Activa Total (kW)" unit="kW" filled />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            🏆 Top 10 Consumidores
          </div>
          {topData.length > 0
            ? <SvgHBarChart data={topData} />
            : <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center', paddingTop: '20px' }}>Sin datos</div>
          }
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            📊 Estado Contadores
          </div>
          <SvgDonutChart slices={[
            { label: 'Conectados', value: connected - alarm, color: '#10b981' },
            { label: 'Con Alarma',  value: alarm,   color: '#ef4444' },
            { label: 'Offline',    value: offline,  color: 'rgba(255,255,255,0.2)' },
          ]} />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'es';
  });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = makeT(lang);

  if (!auth) return <LoginScreen onLogin={setAuth} t={t} lang={lang} changeLang={changeLang} />;

  const isTecnico = auth.role === 'ROLE_TECNICO';
  if (isTecnico) return <TechView auth={auth} onLogout={() => setAuth(null)} t={t} lang={lang} changeLang={changeLang} />;

  return <AdminView auth={auth} onLogout={() => setAuth(null)} t={t} lang={lang} changeLang={changeLang} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── BESS MAP SPAIN VIEW ─────────────────────────────────────────────────────

interface BessLocation {
  id: number;
  name: string;
  city: string;
  region: string;
  capacity: string;  // MW
  x: number; // 0-1000 SVG coordinate
  y: number; // 0-700 SVG coordinate
  bateriaId: number;
}

const BESS_LOCATIONS: BessLocation[] = [
  { id: 1,  name: 'BESS Alpha — Subestación 220kV',          city: 'Madrid',       region: 'Comunidad de Madrid',    capacity: '50 MW',  x: 490, y: 340, bateriaId: 1 },
  { id: 2,  name: 'BESS Beta — Parque Solar Guadalquivir',   city: 'Sevilla',      region: 'Andalucía',              capacity: '40 MW',  x: 350, y: 550, bateriaId: 2 },
  { id: 3,  name: 'BESS Gamma — Planta Industrial 66kV',     city: 'Barcelona',    region: 'Cataluña',               capacity: '30 MW',  x: 840, y: 230, bateriaId: 3 },
  { id: 4,  name: 'BESS Delta — Hub Eólico Norte',           city: 'Bilbao',       region: 'País Vasco',             capacity: '25 MW',  x: 470, y: 120, bateriaId: 1 },
  { id: 5,  name: 'BESS Epsilon — Parque Eólico Navarra',    city: 'Pamplona',     region: 'Navarra',                capacity: '35 MW',  x: 550, y: 150, bateriaId: 2 },
  { id: 6,  name: 'BESS Zeta — Hub Renovables Ebro',         city: 'Zaragoza',     region: 'Aragón',                 capacity: '20 MW',  x: 640, y: 250, bateriaId: 3 },
  { id: 7,  name: 'BESS Eta — Subestación Levante 132kV',    city: 'Valencia',     region: 'Comunitat Valenciana',   capacity: '45 MW',  x: 710, y: 400, bateriaId: 1 },
  { id: 8,  name: 'BESS Theta — Centro Control Córdoba',     city: 'Córdoba',      region: 'Andalucía',              capacity: '28 MW',  x: 410, y: 510, bateriaId: 2 },
  { id: 9,  name: 'BESS Iota — Parque Solar Extremadura',   city: 'Mérida',       region: 'Extremadura',            capacity: '60 MW',  x: 290, y: 450, bateriaId: 3 },
  { id: 10, name: 'BESS Kappa — Nodo Eólico Galicia',       city: 'A Coruña',     region: 'Galicia',                capacity: '32 MW',  x: 150, y: 110, bateriaId: 1 },
  { id: 11, name: 'BESS Lambda — Parque Solar Almería',     city: 'Almería',      region: 'Andalucía',              capacity: '55 MW',  x: 570, y: 590, bateriaId: 2 },
  { id: 12, name: 'BESS Mu — Hub Canarias Norte',           city: 'Las Palmas',   region: 'Canarias',               capacity: '18 MW',  x: 160, y: 640, bateriaId: 3 },
];

function BessMapView({ auth, t = (k: TranslationKey) => k }: { auth: AuthState; t?: (k: TranslationKey) => string }) {
  const [statuses, setStatuses] = useState<BateriaStatus[]>(mockBessStatuses);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pinnedPos, setPinnedPos] = useState({ x: 0, y: 0 });
  const [apiConnected, setApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [pulseAngle, setPulseAngle] = useState(0);
  const mapRef = React.useRef<SVGSVGElement>(null);

  // ESC key listener to unpin dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setPinnedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pulse animation for active batteries
  useEffect(() => {
    const anim = setInterval(() => setPulseAngle(a => (a + 3) % 360), 50);
    return () => clearInterval(anim);
  }, []);

  // Fetch live BESS status from Oracle DB endpoint
  const fetchStatuses = async () => {
    try {
      const res = await fetch('/api/baterias/status', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data: BateriaStatus[] = await res.json();
        if (data && data.length > 0) {
          setStatuses(data);
          setApiConnected(true);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } else {
        setApiConnected(false);
      }
    } catch {
      setApiConnected(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [auth]);

  // Map bateriaId → latest status
  const statusByBateriaId = (bid: number): BateriaStatus | undefined =>
    statuses.filter(s => s.bateriaId === bid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const getFlowState = (loc: BessLocation): string => {
    const s = statusByBateriaId(loc.bateriaId);
    if (!s) return ['CARGANDO', 'SUMINISTRANDO', 'STANDBY'][loc.id % 3];
    return s.flowState || 'STANDBY';
  };

  const getStateColor = (state: string): string => {
    if (state === 'SUMINISTRANDO') return '#a855f7';  // Neon purple — discharging
    if (state === 'CARGANDO')       return '#10b981';  // Neon green — charging
    return '#f59e0b';                                   // Neon amber — standby
  };

  const getStateGlow = (state: string): string => {
    if (state === 'SUMINISTRANDO') return 'rgba(168,85,247,0.8)';
    if (state === 'CARGANDO')       return 'rgba(16,185,129,0.8)';
    return 'rgba(245,158,11,0.8)';
  };

  const getStateLabel = (state: string): string => {
    if (state === 'SUMINISTRANDO') return '⚡ Suministrando';
    if (state === 'CARGANDO')       return '🔋 Cargando';
    return '⏸ Standby';
  };

  const getSoc = (loc: BessLocation): number => {
    const s = statusByBateriaId(loc.bateriaId);
    if (s?.soc) return s.soc;
    return [82.5, 45.0, 91.0, 62.0, 71.0, 33.0, 88.0, 55.0, 77.0, 48.0, 93.0, 66.0][loc.id - 1] ?? 75;
  };

  const getTemp = (loc: BessLocation): number => {
    const s = statusByBateriaId(loc.bateriaId);
    return s?.temperature ?? 22 + (loc.id % 5) * 2.3;
  };

  const getPower = (loc: BessLocation): number => {
    const s = statusByBateriaId(loc.bateriaId);
    return s?.power ? parseFloat(s.power.toFixed(1)) : parseFloat((10 + loc.id * 3.2).toFixed(1));
  };

  // Aggregated metrics
  const totalCargando = BESS_LOCATIONS.filter(l => getFlowState(l) === 'CARGANDO').length;
  const totalSuministrando = BESS_LOCATIONS.filter(l => getFlowState(l) === 'SUMINISTRANDO').length;
  const totalStandby = BESS_LOCATIONS.filter(l => getFlowState(l) === 'STANDBY').length;
  const avgSoc = Math.round(BESS_LOCATIONS.reduce((s, l) => s + getSoc(l), 0) / BESS_LOCATIONS.length);
  const totalCapacity = BESS_LOCATIONS.reduce((s, l) => s + parseInt(l.capacity), 0);
  const activePower = BESS_LOCATIONS
    .filter(l => getFlowState(l) !== 'STANDBY')
    .reduce((s, l) => s + getPower(l), 0);

  // Active location: pinned takes precedence over hovered
  const isPinned = pinnedId !== null;
  const activeLocId = pinnedId ?? hoveredId;
  const activeLoc = BESS_LOCATIONS.find(l => l.id === activeLocId);
  const activeStatus = activeLoc ? statusByBateriaId(activeLoc.bateriaId) : undefined;
  const activePos = isPinned ? pinnedPos : tooltipPos;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CONNECTION STATUS BANNER */}
      <div style={{
        background: apiConnected
          ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.04))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.04))',
        border: `1px solid ${apiConnected ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
        borderRadius: '14px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        boxShadow: apiConnected ? '0 4px 20px rgba(16,185,129,0.15)' : '0 4px 20px rgba(245,158,11,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: apiConnected ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 12px ${apiConnected ? '#10b981' : '#f59e0b'}`
          }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
              {apiConnected
                ? '🟢 Conectado a Oracle Database (192.168.1.135:1521/ORCLPDB1) — Telemetría en Vivo'
                : '🟡 Modo Demostración — Oracle DB No Disponible. Mostrando Respaldo de Telemetría.'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {apiConnected
                ? 'Los datos de las baterías y puntos de conexión se están transmitiendo en tiempo real desde la BD Oracle en VirtualBox.'
                : 'Se están utilizando datos simulados de respaldo para garantizar el funcionamiento offline del mapa.'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'right' }}>
          <div>Última sincronización</div>
          <strong style={{ color: '#fff' }}>{lastUpdate}</strong>
        </div>
      </div>

      {/* LEYENDA + CONTROLES */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Escala Cromática:</span>
          {[
            ['SUMINISTRANDO', '#a855f7', '⚡ Suministrando (Descarga)'],
            ['CARGANDO', '#10b981', '🔋 Cargando (Inyección)'],
            ['STANDBY', '#f59e0b', '⏸ Standby (Reposo)']
          ].map(([state, color, label]) => (
            <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color as string, boxShadow: `0 0 10px ${color}` }} />
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>💡 <em>Haz clic en cualquier nodo para fijar la información (ESC para cerrar)</em></span>
          <span>•</span>
          <span>Total Ubicaciones: <strong style={{ color: 'var(--primary)' }}>{BESS_LOCATIONS.length} Nodos BESS</strong></span>
        </div>
      </div>

      {/* MAIN MAP CONTAINER + PANEL */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* DETAILED SPAIN VECTOR SVG MAP */}
        <div
          onClick={() => setPinnedId(null)}
          style={{
            flex: '1 1 640px', position: 'relative',
            background: 'linear-gradient(145deg, #090d16 0%, #05070e 100%)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: '24px', overflow: 'hidden', minHeight: '520px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(0,242,254,0.05) inset'
          }}
        >
          {/* Subtle Grid Pattern Overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: 'radial-gradient(rgba(0, 242, 254, 0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px', pointerEvents: 'none'
          }} />

          {/* Detailed SVG Map of Spain */}
          <svg
            ref={mapRef}
            viewBox="0 0 1000 700"
            style={{ width: '100%', height: '100%', display: 'block', minHeight: '520px' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glow filters */}
              <filter id="spain-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="pin-glow-effect">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Map background fill gradient */}
              <linearGradient id="spainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 242, 254, 0.15)" />
                <stop offset="50%" stopColor="rgba(112, 0, 255, 0.08)" />
                <stop offset="100%" stopColor="rgba(14, 165, 233, 0.18)" />
              </linearGradient>

              {/* Portugal gradient */}
              <linearGradient id="portugalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.03)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.01)" />
              </linearGradient>
            </defs>

            {/* Ocean Waves Background Styling */}
            <rect x="0" y="0" width="1000" height="700" fill="transparent" />

            {/* PORTUGAL OUTLINE (Shaded to complete Iberian geography) */}
            <path
              d="M 135,160 L 160,190 L 180,230 L 210,270 L 245,310 L 265,360 L 275,410 L 285,460 L 290,530 L 295,585 L 320,610 L 310,630 L 280,635 L 250,620 L 230,570 L 220,500 L 210,430 L 195,360 L 185,300 L 165,240 L 135,190 Z"
              fill="url(#portugalGrad)"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text x="220" y="420" fontSize="13" fill="rgba(255,255,255,0.15)" fontFamily="sans-serif" fontWeight="bold" letterSpacing="4">PORTUGAL</text>

            {/* MAINLAND SPAIN DETAILED OUTLINE */}
            <path
              d="M 130,120 
                 L 160,95 L 210,90 L 260,95 L 310,100 L 370,105 L 430,115 L 470,120 L 510,128 L 550,135 L 610,145 L 660,158 L 710,170 L 760,182 L 840,210 L 880,225 L 895,245 
                 L 865,275 L 845,305 L 805,340 L 765,375 L 735,410 L 715,460 L 700,505 L 685,545 L 650,570 L 605,600 L 580,615 L 530,635 L 470,650 L 415,660 L 395,650 L 365,630 L 350,580 
                 L 320,570 L 295,585 L 290,530 L 285,460 L 275,410 L 265,360 L 245,310 L 210,270 L 180,230 L 160,190 L 130,160 L 115,135 Z"
              fill="url(#spainGrad)"
              stroke="#00f2fe"
              strokeWidth="2.5"
              filter="url(#spain-glow)"
            />

            {/* Internal Regional Lines (Autonomous Communities boundaries preview) */}
            {/* Pyrenees France Border line */}
            <path d="M 470,120 Q 600,145 880,225" fill="none" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* ISLAS BALEARES */}
            <g id="baleares">
              {/* Mallorca */}
              <path d="M 870,390 L 910,380 L 930,410 L 890,435 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="2" filter="url(#spain-glow)" />
              <text x="890" y="372" fontSize="11" fill="rgba(0,242,254,0.7)" fontWeight="bold">Mallorca</text>
              {/* Menorca */}
              <path d="M 945,365 L 965,360 L 960,375 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              {/* Ibiza & Formentera */}
              <path d="M 830,440 L 845,435 L 840,450 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              <text x="825" y="470" fontSize="11" fill="rgba(0,242,254,0.6)" fontWeight="bold">BALEARES</text>
            </g>

            {/* ISLAS CANARIAS INSET BOX */}
            <g id="canarias-inset" transform="translate(30, 520)">
              <rect x="0" y="0" width="220" height="150" rx="12" fill="rgba(5,7,14,0.85)" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="12" y="20" fontSize="11" fill="var(--primary)" fontWeight="bold" letterSpacing="1">ISLAS CANARIAS</text>

              {/* Tenerife */}
              <path d="M 70,80 L 90,65 L 105,85 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              {/* Gran Canaria */}
              <circle cx="130" cy="85" r="12" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              {/* Lanzarote & Fuerteventura */}
              <path d="M 170,40 L 185,25 L 190,50 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              <path d="M 160,55 L 175,75 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
              {/* La Palma */}
              <path d="M 30,55 L 42,50 L 38,70 Z" fill="url(#spainGrad)" stroke="#00f2fe" strokeWidth="1.5" />
            </g>

            {/* MAIN CITIES LABELS FOR GEOGRAPHICAL REFERENCE */}
            {[
              { name: 'MADRID', x: 490, y: 360 },
              { name: 'BARCELONA', x: 840, y: 215 },
              { name: 'SEVILLA', x: 350, y: 575 },
              { name: 'BILBAO', x: 470, y: 105 },
              { name: 'VALENCIA', x: 710, y: 420 },
              { name: 'ZARAGOZA', x: 640, y: 235 },
              { name: 'A CORUÑA', x: 150, y: 95 },
            ].map(c => (
              <text key={c.name} x={c.x} y={c.y} fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {c.name}
              </text>
            ))}

            {/* COMPASS ROSA DE LOS VIENTOS */}
            <g transform="translate(930, 80)">
              <circle cx="0" cy="0" r="24" fill="rgba(0,0,0,0.4)" stroke="rgba(0,242,254,0.3)" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(0,242,254,0.5)" strokeWidth="1.5" />
              <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(0,242,254,0.5)" strokeWidth="1.5" />
              <text x="0" y="-8" fontSize="12" fill="#00f2fe" textAnchor="middle" fontWeight="bold">N</text>
            </g>

            {/* BESS BATTERY PINS (LOCATIONS) */}
            {BESS_LOCATIONS.map(loc => {
              const state = getFlowState(loc);
              const color = getStateColor(state);
              const isSelected = activeLocId === loc.id;
              const soc = getSoc(loc);
              const outerR = isSelected ? 18 : 13;
              const innerR = isSelected ? 10 : 7;

              return (
                <g
                  key={loc.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinnedId === loc.id) {
                      setPinnedId(null);
                    } else {
                      setPinnedId(loc.id);
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      setPinnedPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }
                  }}
                  onMouseEnter={(e) => {
                    setHoveredId(loc.id);
                    if (!pinnedId) {
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!pinnedId) {
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Pulse Ring Animation for Charging/Discharging */}
                  {state !== 'STANDBY' && (
                    <circle
                      cx={loc.x} cy={loc.y}
                      r={outerR + 6 + Math.sin((pulseAngle * Math.PI / 180) + loc.id) * 4}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity={0.4 + Math.sin((pulseAngle * Math.PI / 180) + loc.id * 0.5) * 0.3}
                    />
                  )}

                  {/* Glowing halo */}
                  <circle cx={loc.x} cy={loc.y} r={outerR + (isSelected ? 6 : 3)} fill={color} opacity={isSelected ? 0.45 : 0.25} filter="url(#pin-glow-effect)" />

                  {/* Outer Ring */}
                  <circle cx={loc.x} cy={loc.y} r={outerR} fill="#090d16" stroke={color} strokeWidth={isSelected ? "3.5" : "2.5"} />

                  {/* SOC Progress Meter Arc */}
                  <circle
                    cx={loc.x} cy={loc.y}
                    r={outerR}
                    fill="none"
                    stroke={color}
                    strokeWidth="3.5"
                    strokeDasharray={`${((soc / 100) * (2 * Math.PI * outerR)).toFixed(1)} 200`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${loc.x} ${loc.y})`}
                  />

                  {/* Core Pin Dot */}
                  <circle cx={loc.x} cy={loc.y} r={innerR} fill={color} filter="url(#pin-glow-effect)" />

                  {/* Pin ID Label */}
                  <text
                    x={loc.x}
                    y={loc.y - outerR - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isSelected ? "#00f2fe" : "#fff"}
                    fontFamily="sans-serif"
                    fontWeight="800"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                  >
                    #{loc.id} {loc.city} {pinnedId === loc.id ? '📌' : ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* DYNAMIC & PINNED TOOLTIP DIALOG */}
          {activeLocId !== null && activeLoc && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: Math.min(activePos.x + 16, window.innerWidth - 330),
                top: Math.max(activePos.y - 20, 10),
                background: 'rgba(9, 13, 22, 0.98)',
                border: isPinned
                  ? `2px solid ${getStateColor(getFlowState(activeLoc))}`
                  : `1.5px solid ${getStateColor(getFlowState(activeLoc))}`,
                borderRadius: '16px', padding: '16px 18px', width: '290px',
                boxShadow: isPinned
                  ? `0 16px 48px rgba(0,0,0,0.9), 0 0 30px ${getStateGlow(getFlowState(activeLoc))}`
                  : `0 12px 40px rgba(0,0,0,0.8), 0 0 20px ${getStateGlow(getFlowState(activeLoc))}`,
                zIndex: 300,
                pointerEvents: isPinned ? 'auto' : 'none',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* PINNED STATUS BANNER WITH CLOSE BUTTON */}
              {isPinned && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: `${getStateColor(getFlowState(activeLoc))}22`,
                  borderRadius: '8px', padding: '4px 10px', marginBottom: '12px',
                  border: `1px solid ${getStateColor(getFlowState(activeLoc))}44`
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: getStateColor(getFlowState(activeLoc)) }}>
                    📌 INFORMACIÓN FIJADA · ESC para cerrar
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPinnedId(null); }}
                    style={{
                      background: 'none', border: 'none', color: '#fff', fontSize: '14px',
                      fontWeight: 'bold', cursor: 'pointer', padding: '0 4px', lineHeight: 1
                    }}
                    title="Cerrar (ESC)"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Tooltip Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: getStateColor(getFlowState(activeLoc)),
                  boxShadow: `0 0 10px ${getStateGlow(getFlowState(activeLoc))}`,
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>{activeLoc.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px', fontWeight: '600' }}>{activeLoc.city} ({activeLoc.region})</div>
                </div>
              </div>

              {/* State Badge */}
              <div style={{
                padding: '5px 12px', borderRadius: '20px', display: 'inline-block',
                background: `${getStateColor(getFlowState(activeLoc))}22`,
                border: `1px solid ${getStateColor(getFlowState(activeLoc))}55`,
                color: getStateColor(getFlowState(activeLoc)),
                fontSize: '12px', fontWeight: '800', marginBottom: '14px'
              }}>
                {getStateLabel(getFlowState(activeLoc))}
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  ['SOC Batería', `${getSoc(activeLoc).toFixed(1)}%`],
                  ['Potencia Actual', `${getPower(activeLoc)} kW`],
                  ['Temperatura', `${getTemp(activeLoc).toFixed(1)} °C`],
                  ['Capacidad Total', activeLoc.capacity],
                  ...(activeStatus ? [
                    ['Tensión', `${activeStatus.voltage.toFixed(1)} V`],
                    ['Corriente', `${activeStatus.current.toFixed(1)} A`],
                    ['Frecuencia', `${(activeStatus.frequency || 50).toFixed(2)} Hz`],
                    ['Conexión DB', `BESS #${activeStatus.bateriaId}`],
                  ] : []),
                ].map(([label, value]) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                    padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* SOC Meter Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nivel de Carga (SOC)</span>
                  <span style={{ fontSize: '11px', color: getStateColor(getFlowState(activeLoc)), fontWeight: '800' }}>{getSoc(activeLoc).toFixed(1)}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    width: `${getSoc(activeLoc)}%`,
                    background: `linear-gradient(90deg, ${getStateColor(getFlowState(activeLoc))}, ${getStateGlow(getFlowState(activeLoc))})`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Data Source Badge */}
              <div style={{ marginTop: '12px', fontSize: '10px', color: apiConnected ? '#10b981' : '#f59e0b', textAlign: 'right', fontWeight: '700' }}>
                {apiConnected ? '● Oracle DB Online (192.168.1.135)' : '○ Telemetría Demo Offline'}
              </div>
            </div>
          )}
        </div>

        {/* GLOBAL SUMMARY SIDEBAR PANEL */}
        <div style={{
          flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          {/* Main Summary Header */}
          <div className="scada-card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(0,242,254,0.08) 0%, rgba(112,0,255,0.04) 100%)' }}>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>RESUMEN GLOBAL DEL PARQUE</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>{BESS_LOCATIONS.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Instalaciones BESS en España</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#00f2fe', marginTop: '12px' }}>{totalCapacity} MW</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacidad Total Instalada</div>
          </div>

          {/* Breakdown by Status */}
          <div className="scada-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Estado Operativo</div>
            {[
              { label: 'Suministrando', count: totalSuministrando, color: '#a855f7', icon: '⚡' },
              { label: 'Cargando', count: totalCargando, color: '#10b981', icon: '🔋' },
              { label: 'Standby', count: totalStandby, color: '#f59e0b', icon: '⏸' },
            ].map(({ label, count, color, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>{icon} {label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: `${(count / BESS_LOCATIONS.length) * 70}px`, height: '5px', borderRadius: '3px', background: color, opacity: 0.8 }} />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Global Indicators */}
          <div className="scada-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Indicadores de Red</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SOC Promedio Parque</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: avgSoc > 60 ? '#10b981' : avgSoc > 30 ? '#f59e0b' : '#ef4444' }}>{avgSoc}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', width: `${avgSoc}%`, background: avgSoc > 60 ? 'linear-gradient(90deg,#10b981,#34d399)' : avgSoc > 30 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)', transition: 'width 0.5s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Potencia Activa</span>
                <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)' }}>{activePower.toFixed(0)} kW</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nodos Activos</span>
                <span style={{ fontSize: '17px', fontWeight: '800', color: '#fff' }}>{totalSuministrando + totalCargando} / {BESS_LOCATIONS.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Location List */}
          <div className="scada-card" style={{ padding: '18px', maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Listado de Nodos</div>
            {BESS_LOCATIONS.map(loc => {
              const state = getFlowState(loc);
              const color = getStateColor(state);
              const isPinnedLoc = pinnedId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinnedId(isPinnedLoc ? null : loc.id);
                    setPinnedPos({ x: loc.x, y: loc.y });
                  }}
                  onMouseEnter={() => { if (!pinnedId) setHoveredId(loc.id); }}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
                    background: isPinnedLoc ? `${color}33` : (hoveredId === loc.id ? 'rgba(0, 242, 254, 0.12)' : 'transparent'),
                    border: isPinnedLoc ? `1px solid ${color}` : (hoveredId === loc.id ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent'),
                    transition: 'all 0.15s ease', marginBottom: '4px'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {loc.city} {isPinnedLoc ? '📌' : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{loc.capacity} · SOC {getSoc(loc).toFixed(0)}%</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color, flexShrink: 0 }}>
                    {state === 'SUMINISTRANDO' ? '⚡' : state === 'CARGANDO' ? '🔋' : '⏸'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AdminView({ auth, onLogout, t, lang, changeLang }: {
  auth: AuthState;
  onLogout: () => void;
  t: (k: TranslationKey) => string;
  lang: Lang;
  changeLang: (l: Lang) => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clientes' | 'medidores' | 'incidencias' | 'scada' | 'bess' | 'bessmap'>('dashboard');

  // Data States
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [medidores, setMedidores] = useState<Medidor[]>(mockMedidores);
  const [incidencias, setIncidencias] = useState<Incidencia[]>(mockIncidencias);

  // Loading & Alert state
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Form States
  const [newCliente, setNewCliente] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [newMedidor, setNewMedidor] = useState({ numeroSerie: '', ubicacion: '', clienteId: '' });
  const [newLectura, setNewLectura] = useState({ medidorId: '', valor: '', fecha: '' });
  const [newIncidencia, setNewIncidencia] = useState({ medidorId: '', descripcion: '', fecha: '' });

  // Modal Open states
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showMedidorModal, setShowMedidorModal] = useState(false);
  const [showLecturaModal, setShowLecturaModal] = useState(false);
  const [showIncidenciaModal, setShowIncidenciaModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Oracle Host IP Config state
  const [oracleIp, setOracleIp] = useState('192.168.1.135');
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const [configFeedback, setConfigFeedback] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Base API URL
  const API_BASE = '/api';

  // Fetch helper
  const fetchData = async () => {
    if (!auth) return;
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const resClientes = await fetch(`${API_BASE}/clientes`, { headers });
      if (!resClientes.ok) throw new Error("API not fully initialized yet");
      const dataClientes = await resClientes.json();

      const resMedidores = await fetch(`${API_BASE}/medidores`, { headers });
      const dataMedidores = await resMedidores.json();

      const resIncidencias = await fetch(`${API_BASE}/incidencias`, { headers });
      const dataIncidencias = await resIncidencias.json();

      setClientes(dataClientes);
      setMedidores(dataMedidores);
      setIncidencias(dataIncidencias);
      setApiConnected(true);
    } catch (e) {
      console.warn("Backend API not reachable. Using premium mock fallback data for display.", e);
      setApiConnected(false);
    }
  };

  const fetchOracleConfig = async () => {
    if (!auth) return;
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const res = await fetch(`${API_BASE}/config/oracle-ip`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.oracleIp) setOracleIp(data.oracleIp);
        if (data.connected !== undefined) setApiConnected(data.connected);
      }
    } catch (ignored) {}
  };

  useEffect(() => {
    if (auth) {
      fetchData();
      fetchOracleConfig();
      const interval = setInterval(fetchData, 5000); // Poll API every 5s
      return () => clearInterval(interval);
    }
  }, [auth]);

  const handleUpdateOracleIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleIp) return;
    setConfigSubmitting(true);
    setConfigFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/config/oracle-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ oracleIp, port: 1521, serviceName: 'ORCLPDB1' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfigFeedback({ text: data.message, type: 'success' });
        setApiConnected(true);
        triggerNotification(data.message, 'success');
        fetchData();
        setTimeout(() => setShowConfigModal(false), 2000);
      } else {
        setConfigFeedback({ text: data.message || "Error al conectar con la IP especificada.", type: 'danger' });
        setApiConnected(false);
      }
    } catch (err) {
      setConfigFeedback({ text: "Error de red al aplicar la nueva IP de Oracle.", type: 'danger' });
    } finally {
      setConfigSubmitting(false);
    }
  };

  const triggerNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- ACTIONS ---

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliente.nombre || !newCliente.email) return;

    if (apiConnected) {
      try {
        const response = await fetch(`${API_BASE}/clientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
          body: JSON.stringify(newCliente)
        });
        if (response.ok) {
          const created = await response.json();
          setClientes([...clientes, created]);
          triggerNotification("Cliente creado exitosamente en base de datos Oracle.");
          setShowClienteModal(false);
          setNewCliente({ nombre: '', email: '', telefono: '', direccion: '' });
          fetchData();
        } else {
          const errMsg = await response.text();
          triggerNotification(errMsg || "Error al crear cliente.", "danger");
        }
      } catch (err) {
        triggerNotification("Error de red con el backend.", "danger");
      }
    } else {
      const localNew: Cliente = {
        id: clientes.length + 1,
        nombre: newCliente.nombre,
        email: newCliente.email,
        telefono: newCliente.telefono,
        direccion: newCliente.direccion,
        fechaAlta: new Date().toISOString().split('T')[0]
      };
      setClientes([...clientes, localNew]);
      triggerNotification("Cliente creado en modo Demostración (Offline).");
      setShowClienteModal(false);
      setNewCliente({ nombre: '', email: '', telefono: '', direccion: '' });
    }
  };

  const handleCreateMedidor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedidor.numeroSerie || !newMedidor.clienteId) return;

    const clienteIdNum = parseInt(newMedidor.clienteId);
    const selectedCliente = clientes.find(c => c.id === clienteIdNum);
    if (!selectedCliente) return;

    if (apiConnected) {
      try {
        const response = await fetch(`${API_BASE}/medidores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
          body: JSON.stringify({
            numeroSerie: newMedidor.numeroSerie,
            ubicacion: newMedidor.ubicacion,
            cliente: { id: clienteIdNum }
          })
        });
        if (response.ok) {
          triggerNotification("Contador registrado exitosamente en Oracle DB.");
          setShowMedidorModal(false);
          setNewMedidor({ numeroSerie: '', ubicacion: '', clienteId: '' });
          fetchData();
        } else {
          const errMsg = await response.text();
          triggerNotification(errMsg || "Error al registrar medidor.", "danger");
        }
      } catch (err) {
        triggerNotification("Error de red con el backend.", "danger");
      }
    } else {
      const localNew: Medidor = {
        id: medidores.length + 1,
        numeroSerie: newMedidor.numeroSerie,
        ubicacion: newMedidor.ubicacion,
        tipoTarifa: "RESIDENCIAL",
        activo: true,
        cliente: selectedCliente
      };
      setMedidores([...medidores, localNew]);
      triggerNotification("Contador registrado en modo Demostración.");
      setShowMedidorModal(false);
      setNewMedidor({ numeroSerie: '', ubicacion: '', clienteId: '' });
    }
  };

  const handleRegisterLectura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectura.medidorId || !newLectura.valor) return;

    const medId = parseInt(newLectura.medidorId);
    const valorNum = parseFloat(newLectura.valor);
    const fechaVal = newLectura.fecha || new Date().toISOString().split('T')[0];

    const medidorObj = medidores.find(m => m.id === medId);
    if (!medidorObj) return;

    if (apiConnected) {
      try {
        const response = await fetch(`${API_BASE}/medidores/${medId}/lecturas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
          body: JSON.stringify({
            valor: valorNum,
            fecha: fechaVal
          })
        });
        if (response.ok) {
          triggerNotification("Lectura guardada exitosamente en la base de datos.");
          setShowLecturaModal(false);
          setNewLectura({ medidorId: '', valor: '', fecha: '' });
          fetchData();
        } else {
          const errMsg = await response.text();
          triggerNotification(errMsg || "Error al procesar lectura.", "danger");
        }
      } catch (err) {
        triggerNotification("Error al conectar con la API backend.", "danger");
      }
    } else {
      triggerNotification("Lectura guardada localmente (Simulado).");
      setShowLecturaModal(false);
      setNewLectura({ medidorId: '', valor: '', fecha: '' });
    }
  };

  const handleCreateIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidencia.medidorId || !newIncidencia.descripcion) return;

    const medId = parseInt(newIncidencia.medidorId);
    const fechaVal = newIncidencia.fecha || new Date().toISOString().split('T')[0];

    const medidorObj = medidores.find(m => m.id === medId);
    if (!medidorObj) return;

    if (apiConnected) {
      try {
        const response = await fetch(`${API_BASE}/incidencias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
          body: JSON.stringify({
            medidor: { id: medId },
            fechaIncidencia: fechaVal,
            descripcion: newIncidencia.descripcion,
            estado: 'ABIERTA'
          })
        });
        if (response.ok) {
          triggerNotification("Incidencia registrada con éxito.");
          setShowIncidenciaModal(false);
          setNewIncidencia({ medidorId: '', descripcion: '', fecha: '' });
          fetchData();
        } else {
          const errMsg = await response.text();
          triggerNotification(errMsg || "Error al registrar incidencia.", "danger");
        }
      } catch (err) {
        triggerNotification("Error de red con el backend.", "danger");
      }
    } else {
      const localNew: Incidencia = {
        id: incidencias.length + 1,
        medidor: medidorObj,
        fechaIncidencia: fechaVal,
        descripcion: newIncidencia.descripcion,
        estado: 'ABIERTA'
      };
      setIncidencias([localNew, ...incidencias]);
      triggerNotification("Incidencia registrada localmente (Demostración).");
      setShowIncidenciaModal(false);
      setNewIncidencia({ medidorId: '', descripcion: '', fecha: '' });
    }
  };

  const handleResolveIncidencia = async (id: number) => {
    if (apiConnected) {
      try {
        const response = await fetch(`${API_BASE}/incidencias/${id}/resolver`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (response.ok) {
          triggerNotification("Incidencia marcada como resuelta.");
          fetchData();
        } else {
          triggerNotification("Error al resolver incidencia.", "danger");
        }
      } catch (e) {
        triggerNotification("Error de red al resolver incidencia.", "danger");
      }
    } else {
      setIncidencias(incidencias.map(i => i.id === id ? { ...i, estado: 'RESUELTA' } : i));
      triggerNotification("Incidencia resuelta (Simulado).");
    }
  };

  // --- STATS CALCULATIONS ---
  const activeMetersCount = medidores.length;
  const totalIncidenciasCount = incidencias.length;
  const pendingIncidenciasCount = incidencias.filter(i => i.estado === 'ABIERTA').length;
  const clientesCount = clientes.length;

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--panel-border)' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #00f2fe 0%, #7000ff 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#050510" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ELECTRICIDAD
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', letterSpacing: '2px' }}>PRO SYSTEM</span>
          </div>
        </div>

        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`premium-btn-secondary ${activeTab === 'dashboard' ? 'glow-active' : ''}`}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            {t('nav_dashboard')}
          </button>
          <button 
            onClick={() => setActiveTab('scada')} 
            className={`premium-btn-secondary ${activeTab === 'scada' ? 'glow-active' : ''}`}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'scada' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'scada' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            {t('page_scada')}
          </button>
          <button 
            onClick={() => setActiveTab('clientes')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'clientes' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'clientes' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            {t('nav_clients')}
          </button>
          <button 
            onClick={() => setActiveTab('medidores')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'medidores' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'medidores' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            {t('nav_meters')}
          </button>
          <button 
            onClick={() => setActiveTab('incidencias')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'incidencias' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'incidencias' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16" y1="5" x2="20" y2="9"></line><line x1="12" y1="9" x2="20" y2="9"></line><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8"></path><path d="M14 2v6h6"></path><path d="M8 18h4"></path><path d="M8 14h8"></path></svg>
            {t('nav_incidents')}
          </button>
          <button 
            onClick={() => setActiveTab('bess')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'bess' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'bess' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
            {t('nav_bess')}
          </button>
          <button 
            onClick={() => setActiveTab('bessmap')} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', border: 'none',
              background: activeTab === 'bessmap' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(112, 0, 255, 0.05) 100%)' : 'transparent',
              color: activeTab === 'bessmap' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            {t('nav_bessmap')}
          </button>
        </nav>

        {/* SECURITY MONITOR PANEL */}
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--panel-border)' }}>
          <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            {t('sidebar_security')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('sidebar_oracle_subnet')}</span>
              <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '10px' }}>{t('sidebar_isolated')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('sidebar_internet')}</span>
              <span className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '10px' }}>{t('sidebar_blocked')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('sidebar_origin')}</span>
              <span className="badge badge-info" style={{ padding: '2px 8px', fontSize: '10px' }}>ONLY-BACKEND</span>
            </div>
          </div>
          <div style={{ marginTop: '14px', padding: '8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', fontSize: '10px', color: '#10b981', textAlign: 'center' }}>
            {t('sidebar_secure_conn')}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        {/* HEADER BAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {activeTab === 'dashboard' && t('page_dashboard')}
              {activeTab === 'scada' && t('page_scada')}
              {activeTab === 'clientes' && t('page_clients')}
              {activeTab === 'medidores' && t('page_meters')}
              {activeTab === 'incidencias' && t('page_incidents')}
              {activeTab === 'bess' && t('page_bess')}
              {activeTab === 'bessmap' && t('page_bessmap')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {activeTab === 'dashboard' && t('sub_dashboard')}
              {activeTab === 'scada' && t('sub_scada')}
              {activeTab === 'clientes' && t('sub_clients')}
              {activeTab === 'medidores' && t('sub_meters')}
              {activeTab === 'incidencias' && t('sub_incidents')}
              {activeTab === 'bess' && t('sub_bess')}
              {activeTab === 'bessmap' && t('sub_bessmap')}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Selector Flags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  title={l.name}
                  style={{
                    background: lang === l.code ? 'rgba(0,242,254,0.18)' : 'transparent',
                    border: lang === l.code ? '1px solid rgba(0,242,254,0.5)' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: lang === l.code ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{l.flag}</span>
                  <span style={{ fontSize: '11px' }}>{l.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--panel-border)', fontSize: '13px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: apiConnected ? '#10b981' : '#f59e0b', boxShadow: apiConnected ? '0 0 10px #10b981' : '0 0 10px #f59e0b' }}></div>
              <span style={{ color: apiConnected ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                {apiConnected ? `Oracle DB (${oracleIp}:1521) Conectada` : 'Modo Demostración (Offline)'}
              </span>
            </div>

            <button
              onClick={() => { setConfigFeedback(null); setShowConfigModal(true); }}
              style={{
                padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(0, 242, 254, 0.3)',
                background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary)', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              title="Configurar IP del Host VirtualBox con Oracle"
            >
              ⚙️ {t('btn_config_nav')}
            </button>
            {/* User info + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
              <span style={{ fontSize: '18px' }}>👤</span>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{auth.username}</div>
                <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{auth.role}</div>
              </div>
            </div>
            <button
              onClick={() => onLogout()}
              style={{
                padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(231,76,60,0.3)',
                background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.1)'; }}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="fade-in" style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            color: '#ffffff', padding: '16px 24px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
            fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {notification.message}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('kpi_clients')}</span>
                <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#fff' }}>{clientesCount} <span style={{ fontSize: '16px', color: 'var(--primary)' }}>{t('registered')}</span></h3>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(1.5)' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('kpi_active_meters')}</span>
                <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#fff' }}>{activeMetersCount}</h3>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(1.5)' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect></svg>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('kpi_total_incidents')}</span>
                <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#fff' }}>{totalIncidenciasCount}</h3>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(1.5)' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="18" y1="8" x2="22" y2="12"></line><line x1="12" y1="8" x2="22" y2="8"></line><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"></path></svg>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('kpi_open_incidents')}</span>
                <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '12px', color: '#ef4444' }}>{pendingIncidenciasCount}</h3>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05, transform: 'scale(1.5)' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="18" y1="8" x2="22" y2="12"></line><line x1="12" y1="8" x2="22" y2="8"></line><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"></path></svg>
                </div>
              </div>
            </div>

            {/* CHART & DETAILS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              {/* HISTORICAL CHART */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>{t('dash_monthly_chart')}</h3>
                
                <div style={{ position: 'relative', height: '240px', width: '100%', display: 'flex', alignItems: 'end', gap: '24px', paddingBottom: '20px' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', borderTop: '1px dashed rgba(255,255,255,0.05)' }}></div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed rgba(255,255,255,0.05)' }}></div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '80%', borderTop: '1px dashed rgba(255,255,255,0.05)' }}></div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, height: '100%', justifyContent: 'end' }}>
                    <div style={{ height: '20%', width: '36px', background: 'linear-gradient(to top, var(--secondary), var(--primary))', borderRadius: '8px 8px 0 0', boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{t('month_may')}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, height: '100%', justifyContent: 'end' }}>
                    <div style={{ height: '40%', width: '36px', background: 'linear-gradient(to top, var(--secondary), var(--primary))', borderRadius: '8px 8px 0 0', boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{t('month_june')}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, height: '100%', justifyContent: 'end' }}>
                    <div style={{ height: '65%', width: '36px', background: 'linear-gradient(to top, var(--secondary), var(--primary))', borderRadius: '8px 8px 0 0', boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '8px' }}>{t('month_july')}</span>
                  </div>
                </div>
              </div>

              {/* NETWORK MONITOR */}
              <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Oracle Linux Server</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  El backend está configurado para conectar con la base de datos externa a la IP **{oracleIp}** (instancia **ORCLPDB1**), permitiendo una gestión íntegra y segura de la información sin alterar la estructura original.
                </p>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', fontSize: '12px', color: '#10b981', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {t('dash_production')}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>{t('dash_quick_actions')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <button onClick={() => setShowLecturaModal(true)} className="glass-card-interactive" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{t('dash_take_reading')}</div>
                  </button>
                  <button onClick={() => setShowIncidenciaModal(true)} className="glass-card-interactive" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ color: '#ef4444', marginBottom: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{t('dash_report_incident')}</div>
                  </button>
                  <button onClick={() => setShowClienteModal(true)} className="glass-card-interactive" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{t('dash_add_client')}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCADA TAB */}
        {activeTab === 'scada' && (
          <ScadaView auth={auth} medidores={medidores} apiConnected={apiConnected} fetchData={fetchData} t={t} />
        )}

        {/* CLIENTES TAB */}
        {activeTab === 'clientes' && (
          <div className="fade-in glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{t('clients_list')}</h3>
              <button onClick={() => setShowClienteModal(true)} className="premium-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {t('client_new')}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '16px' }}>{t('col_id')}</th>
                    <th style={{ padding: '16px' }}>{t('col_name')}</th>
                    <th style={{ padding: '16px' }}>{t('col_email')}</th>
                    <th style={{ padding: '16px' }}>{t('col_phone')}</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                      <td style={{ padding: '16px', fontWeight: '600' }}>#{c.id}</td>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '500' }}>{c.nombre}</td>
                      <td style={{ padding: '16px' }}>{c.email}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{c.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MEDIDORES TAB */}
        {activeTab === 'medidores' && (
          <div className="fade-in glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{t('meters_title')}</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowLecturaModal(true)} className="premium-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  {t('dash_take_reading')}
                </button>
                <button onClick={() => setShowMedidorModal(true)} className="premium-btn-secondary">
                  {t('meter_register')}
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '16px' }}>{t('col_id')}</th>
                    <th style={{ padding: '16px' }}>{t('col_serial')}</th>
                    <th style={{ padding: '16px' }}>{t('col_client')}</th>
                    <th style={{ padding: '16px' }}>{t('col_location')}</th>
                  </tr>
                </thead>
                <tbody>
                  {medidores.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>#{m.id}</td>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>{m.numeroSerie}</td>
                      <td style={{ padding: '16px' }}>{m.cliente?.nombre || '—'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{m.ubicacion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BESS MONITORING TAB */}
        {activeTab === 'bess' && (
          <BessMonitoringView auth={auth} t={t} />
        )}

        {/* BESS MAP SPAIN TAB */}
        {activeTab === 'bessmap' && (
          <BessMapView auth={auth} t={t} />
        )}

        {/* INCIDENCIAS TAB */}
        {activeTab === 'incidencias' && (
          <div className="fade-in glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{t('incidents_history')}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowIncidenciaModal(true)} className="premium-btn" style={{ padding: '10px 20px', fontSize: '13px' }}>
                  {t('btn_report_incident')}
                </button>
                <a
                  href={`${API_BASE}/incidencias/export/pdf`}
                  download
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: '#fff', textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t('export_pdf')}
                </a>
                <a
                  href={`${API_BASE}/incidencias/export/excel`}
                  download
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
                    color: '#fff', textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t('export_excel')}
                </a>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '16px' }}>{t('col_id')}</th>
                    <th style={{ padding: '16px' }}>{t('col_meter')}</th>
                    <th style={{ padding: '16px' }}>{t('col_client')}</th>
                    <th style={{ padding: '16px' }}>{t('col_date_report')}</th>
                    <th style={{ padding: '16px' }}>{t('col_description')}</th>
                    <th style={{ padding: '16px' }}>{t('col_status')}</th>
                    <th style={{ padding: '16px' }}>{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencias.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>#{i.id}</td>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '500' }}>{i.medidor?.numeroSerie}</td>
                      <td style={{ padding: '16px' }}>{i.medidor?.cliente?.nombre}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{i.fechaIncidencia}</td>
                      <td style={{ padding: '16px' }}>{i.descripcion}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge ${i.estado.toUpperCase() === 'RESUELTA' ? 'badge-success' : 'badge-warning'}`}>
                          {i.estado.toUpperCase() === 'RESUELTA' ? t('resolved') : i.estado}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {i.estado.toUpperCase() === 'ABIERTA' ? (
                          <button onClick={() => handleResolveIncidencia(i.id)} className="premium-btn" style={{ padding: '6px 12px', fontSize: '12px', boxShadow: 'none' }}>
                            {t('resolve')}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>{t('resolved')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* REGISTRAR CLIENTE MODAL */}
      {showClienteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{t('modal_new_client')}</h3>
            <form onSubmit={handleCreateCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_full_name')}</label>
                <input required type="text" className="premium-input" value={newCliente.nombre} onChange={e => setNewCliente({ ...newCliente, nombre: e.target.value })} placeholder="Ej: Jordi Maicas" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_email')}</label>
                <input required type="email" className="premium-input" value={newCliente.email} onChange={e => setNewCliente({ ...newCliente, email: e.target.value })} placeholder="Ej: jordi@test.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_phone')}</label>
                <input type="text" className="premium-input" value={newCliente.telefono} onChange={e => setNewCliente({ ...newCliente, telefono: e.target.value })} placeholder="Ej: 600000000" />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowClienteModal(false)} className="premium-btn-secondary">{t('cancel')}</button>
                <button type="submit" className="premium-btn">{t('btn_save_client')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRAR MEDIDOR (CONTADOR) MODAL */}
      {showMedidorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{t('modal_new_meter')}</h3>
            <form onSubmit={handleCreateMedidor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_assoc_client')}</label>
                <select required className="premium-select" value={newMedidor.clienteId} onChange={e => setNewMedidor({ ...newMedidor, clienteId: e.target.value })}>
                  <option value="">{t('sel_client_ph')}</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_serial')}</label>
                <input required type="text" className="premium-input" value={newMedidor.numeroSerie} onChange={e => setNewMedidor({ ...newMedidor, numeroSerie: e.target.value })} placeholder="Ej: CNT-0002" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_location')}</label>
                <input required type="text" className="premium-input" value={newMedidor.ubicacion} onChange={e => setNewMedidor({ ...newMedidor, ubicacion: e.target.value })} placeholder="Ej: Sant Feliu" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMedidorModal(false)} className="premium-btn-secondary">{t('cancel')}</button>
                <button type="submit" className="premium-btn">{t('btn_reg_meter')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRAR LECTURA MODAL */}
      {showLecturaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{t('modal_reading')}</h3>
            <form onSubmit={handleRegisterLectura} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_sel_meter')}</label>
                <select required className="premium-select" value={newLectura.medidorId} onChange={e => setNewLectura({ ...newLectura, medidorId: e.target.value })}>
                  <option value="">{t('sel_meter_ph')}</option>
                  {medidores.map(m => (
                    <option key={m.id} value={m.id}>{m.numeroSerie} - {m.cliente?.nombre} ({m.ubicacion})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_consumption')}</label>
                <input required type="number" step="0.1" className="premium-input" value={newLectura.valor} onChange={e => setNewLectura({ ...newLectura, valor: e.target.value })} placeholder="Ej: 1520.75" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_read_date')}</label>
                <input type="date" className="premium-input" value={newLectura.fecha} onChange={e => setNewLectura({ ...newLectura, fecha: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowLecturaModal(false)} className="premium-btn-secondary">{t('cancel')}</button>
                <button type="submit" className="premium-btn">{t('btn_reg_reading')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRAR INCIDENCIA MODAL */}
      {showIncidenciaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{t('modal_new_incident')}</h3>
            <form onSubmit={handleCreateIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_sel_meter')}</label>
                <select required className="premium-select" value={newIncidencia.medidorId} onChange={e => setNewIncidencia({ ...newIncidencia, medidorId: e.target.value })}>
                  <option value="">{t('sel_meter_ph')}</option>
                  {medidores.map(m => (
                    <option key={m.id} value={m.id}>{m.numeroSerie} - {m.cliente?.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_inc_desc')}</label>
                <textarea required rows={4} className="premium-input" style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }} value={newIncidencia.descripcion} onChange={e => setNewIncidencia({ ...newIncidencia, descripcion: e.target.value })} placeholder="Ej: Error de lectura remota, pantalla rota..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('label_report_date')}</label>
                <input type="date" className="premium-input" value={newIncidencia.fecha} onChange={e => setNewIncidencia({ ...newIncidencia, fecha: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowIncidenciaModal(false)} className="premium-btn-secondary">{t('cancel')}</button>
                <button type="submit" className="premium-btn">{t('btn_reg_incident')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ORACLE DB HOST IP CONFIGURATION MODAL */}
      {showConfigModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ padding: '30px', width: '90%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚙️ {t('config_oracle_title')}
              </h3>
              <button onClick={() => setShowConfigModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              {t('config_oracle_desc')}
            </p>

            <form onSubmit={handleUpdateOracleIp} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('label_oracle_ip')}
                </label>
                <input
                  type="text"
                  required
                  className="premium-input"
                  value={oracleIp}
                  onChange={e => setOracleIp(e.target.value)}
                  placeholder="Ej: 192.168.1.135 o 192.168.1.132"
                  style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: '700' }}
                />
              </div>

              {configFeedback && (
                <div style={{
                  padding: '12px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  background: configFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: configFeedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: configFeedback.type === 'success' ? '#10b981' : '#f87171',
                  lineHeight: '1.5'
                }}>
                  {configFeedback.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowConfigModal(false)} className="premium-btn-secondary">{t('cancel')}</button>
                <button type="submit" disabled={configSubmitting} className="premium-btn" style={{ opacity: configSubmitting ? 0.7 : 1 }}>
                  {configSubmitting ? t('btn_applying') : t('btn_apply_config')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
