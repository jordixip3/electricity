// ─── i18n / Translations ─────────────────────────────────────────────────────
// Supported languages: es (Castellano), ca (Català), en (English), fr (Français), cs (Čeština), ru (Русский)

export type Lang = 'es' | 'ca' | 'en' | 'fr' | 'cs' | 'ru';

export const LANGUAGES: { code: Lang; label: string; flag: string; name: string }[] = [
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Castellano' },
  { code: 'ca', label: 'CA', flag: '🏴', name: 'Català' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'cs', label: 'CS', flag: '🇨🇿', name: 'Čeština' },
  { code: 'ru', label: 'RU', flag: '🇷🇺', name: 'Русский' },
];

export const translations = {
  // ── Auth / Login ────────────────────────────────────────────────────────────
  login_title:           { es: 'Sistema Eléctrico',                        ca: 'Sistema Elèctric',                    en: 'Electrical System',                   fr: 'Système Électrique',                   cs: 'Elektrický Systém',                    ru: 'Энергосистема' },
  login_subtitle:        { es: 'Gestión de Contadores e Incidencias',      ca: 'Gestió de Comptadors i Incidències',  en: 'Meter & Incident Management',         fr: 'Gestion des Compteurs et Incidents',   cs: 'Správa Elektroměrů a Incidentů',       ru: 'Управление Счетчиками и Инцидентами' },
  login_user:            { es: 'Usuario',                                  ca: 'Usuari',                              en: 'Username',                             fr: 'Utilisateur',                          cs: 'Uživatel',                             ru: 'Имя пользователя' },
  login_password:        { es: 'Contraseña',                               ca: 'Contrasenya',                         en: 'Password',                             fr: 'Mot de passe',                         cs: 'Heslo',                                ru: 'Пароль' },
  login_btn:             { es: 'Entrar al Sistema',                        ca: 'Accedir al Sistema',                  en: 'Log In',                              fr: 'Se Connecter',                         cs: 'Příhlásit se',                         ru: 'Войти в систему' },
  login_loading:         { es: 'Iniciando sesión...',                      ca: 'Iniciant sessió...',                  en: 'Signing in...',                       fr: 'Connexion en cours...',                cs: 'Přihlašování...',                      ru: 'Вход в систему...' },
  login_error_auth:      { es: 'Error de autenticación',                   ca: "Error d'autenticació",               en: 'Authentication error',                fr: "Erreur d'authentification",             cs: 'Chyba autentizace',                    ru: 'Ошибка аутентификации' },
  login_error_conn:      { es: 'Error de conexión',                        ca: 'Error de connexió',                   en: 'Connection error',                    fr: 'Erreur de connexion',                  cs: 'Chyba připojení',                      ru: 'Ошибка соединения' },

  // ── Status / Connection & Config ──────────────────────────────────────────────
  config_oracle_title:   { es: 'Configuración de Conexión Oracle (Host IP)', ca: 'Configuració de Connexió Oracle (Host IP)', en: 'Oracle Connection Settings (Host IP)', fr: 'Paramètres de Connexion Oracle (IP Hôte)', cs: 'Nastavení Připojení Oracle (IP Hostitele)', ru: 'Настройки Подключения Oracle (IP Хоста)' },
  config_oracle_desc:    { es: 'Establece la dirección IP de la máquina host VirtualBox donde está virtualizado el servidor Oracle DB (NAT 10.0.2.15 -> Puerto 1521).', ca: "Estableix l'adreça IP de la màquina host VirtualBox on està virtualitzat el servidor Oracle DB.", en: 'Set the IP address of the VirtualBox host machine running the virtualized Oracle DB server.', fr: "Définissez l'adresse IP de la machine hôte VirtualBox exécutant le serveur Oracle DB virtualisé.", cs: 'Nastavte IP adresu hostitelského počítače VirtualBox s virtualizovaným serverem Oracle DB.', ru: 'Задайте IP-адрес хост-машины VirtualBox с виртуализированным сервером Oracle DB.' },
  label_oracle_ip:       { es: 'IP del Host VirtualBox / Servidor Oracle *', ca: 'IP del Host VirtualBox / Servidor Oracle *', en: 'VirtualBox Host IP / Oracle Server *', fr: "IP de l'Hôte VirtualBox / Serveur Oracle *", cs: 'IP Hostitele VirtualBox / Oracle Server *', ru: 'IP Хоста VirtualBox / Сервер Oracle *' },
  btn_apply_config:      { es: '⚡ Probar y Aplicar Conexión', ca: '⚡ Provar i Aplicar Connexió', en: '⚡ Test & Apply Connection', fr: '⚡ Tester et Appliquer la Connexion', cs: '⚡ Testovat a Použít Připojení', ru: '⚡ Проверить и Применить' },
  btn_applying:          { es: 'Verificando y reconectando...', ca: 'Verificant i re-connectant...', en: 'Testing & reconnecting...', fr: 'Vérification en cours...', cs: 'Ověřování a připojování...', ru: 'Проверка и подключение...' },
  btn_config_nav:        { es: '⚙️ Configurar IP Oracle', ca: '⚙️ Configurar IP Oracle', en: '⚙️ Oracle IP Config', fr: '⚙️ Config IP Oracle', cs: '⚙️ Nastavit Oracle IP', ru: '⚙️ Настроить IP Oracle' },
  status_oracle:         { es: 'Oracle DB Conectada', ca: 'Oracle DB Connectada', en: 'Oracle DB Connected', fr: 'Oracle DB Connectée', cs: 'Oracle DB Připojena', ru: 'Oracle DB Подключена' },
  status_demo:           { es: 'Modo Demostración (Offline)',              ca: 'Mode Demostració (Offline)',          en: 'Demo Mode (Offline)',                 fr: 'Mode Démonstration (Hors ligne)',      cs: 'Demo Režim (Offline)',                 ru: 'Демо Режим (Офлайн)' },
  status_online:         { es: 'Online',                                   ca: 'En línia',                            en: 'Online',                              fr: 'En ligne',                             cs: 'Online',                               ru: 'Онлайн' },
  status_offline:        { es: 'Offline',                                  ca: 'Fora de línia',                       en: 'Offline',                             fr: 'Hors ligne',                           cs: 'Offline',                              ru: 'Офлайн' },

  // ── Common actions ──────────────────────────────────────────────────────────
  cancel:                { es: 'Cancelar',          ca: 'Cancel·lar',      en: 'Cancel',          fr: 'Annuler',          cs: 'Zrušit',          ru: 'Отмена' },
  save:                  { es: 'Guardar',            ca: 'Desar',           en: 'Save',            fr: 'Enregistrer',      cs: 'Uložit',          ru: 'Сохранить' },
  close:                 { es: 'Cerrar',             ca: 'Tancar',          en: 'Close',           fr: 'Fermer',           cs: 'Zavřít',          ru: 'Закрыть' },
  logout:                { es: 'Cerrar Sesión',      ca: 'Tancar Sessió',   en: 'Log Out',         fr: 'Se Déconnecter',   cs: 'Odhlásit se',     ru: 'Выйти' },
  exit:                  { es: 'Salir',              ca: 'Sortir',          en: 'Exit',            fr: 'Quitter',          cs: 'Odejít',          ru: 'Выход' },
  resolve:               { es: 'Resolver',           ca: 'Resoldre',        en: 'Resolve',         fr: 'Résoudre',         cs: 'Vyřešit',         ru: 'Решить' },
  resolved:              { es: 'Resuelta',           ca: 'Resolta',         en: 'Resolved',        fr: 'Résolue',          cs: 'Vyřešeno',        ru: 'Решено' },
  export_pdf:            { es: 'Exportar PDF',       ca: 'Exportar PDF',    en: 'Export PDF',      fr: 'Exporter PDF',     cs: 'Exportovat PDF',  ru: 'Экспорт в PDF' },
  export_excel:          { es: 'Exportar Excel',     ca: 'Exportar Excel',  en: 'Export Excel',    fr: 'Exporter Excel',   cs: 'Exportovat Excel',ru: 'Экспорт в Excel' },
  registered:            { es: 'Registrados',        ca: 'Registrats',      en: 'Registered',      fr: 'Enregistrés',      cs: 'Registrované',    ru: 'Зарегистрировано' },

  // ── Navigation (sidebar) ────────────────────────────────────────────────────
  nav_dashboard:         { es: 'Dashboard',             ca: 'Tauler',                en: 'Dashboard',         fr: 'Tableau de bord',          cs: 'Nástěnka',             ru: 'Панель управления' },
  nav_clients:           { es: 'Clientes',              ca: 'Clients',               en: 'Clients',           fr: 'Clients',                  cs: 'Klienti',              ru: 'Клиенты' },
  nav_meters:            { es: 'Contadores',            ca: 'Comptadors',            en: 'Meters',            fr: 'Compteurs',                cs: 'Elektroměry',          ru: 'Счетчики' },
  nav_incidents:         { es: 'Incidencias',           ca: 'Incidències',           en: 'Incidents',         fr: 'Incidents',                cs: 'Incidenty',            ru: 'Инциденты' },
  nav_bess:              { es: 'Monitoreo BESS',        ca: 'Monitoratge BESS',      en: 'BESS Monitoring',   fr: 'Surveillance BESS',        cs: 'Monitorování BESS',    ru: 'Мониторинг BESS' },
  nav_bessmap:           { es: 'Mapa BESS España',      ca: 'Mapa BESS Espanya',     en: 'BESS Map Spain',    fr: 'Carte BESS Espagne',       cs: 'Mapa BESS Španělsko',  ru: 'Карта BESS Испания' },

  // ── Page titles ─────────────────────────────────────────────────────────────
  page_dashboard:        { es: 'Panel de Control de Electricidad',  ca: "Tauler de Control d'Electricitat",  en: 'Electricity Control Panel',       fr: 'Panneau de Contrôle Électrique',        cs: 'Ovládací Panel Elektřiny',             ru: 'Панель Управления Энергосистемой' },
  page_scada:            { es: 'Visualizador SCADA & PLCs',         ca: 'Visualitzador SCADA & PLCs',        en: 'SCADA & PLC Viewer',              fr: 'Visualiseur SCADA & PLCs',              cs: 'Zobrazovač SCADA a PLC',               ru: 'Мониторинг SCADA и ПЛК' },
  page_clients:          { es: 'Gestión de Clientes',               ca: 'Gestió de Clients',                 en: 'Client Management',               fr: 'Gestion des Clients',                   cs: 'Správa Klientů',                       ru: 'Управление Клиентами' },
  page_meters:           { es: 'Registros de Contadores',           ca: 'Registres de Comptadors',           en: 'Meter Records',                   fr: 'Registres de Compteurs',                cs: 'Záznamy Elektroměrů',                  ru: 'Реестр Счетчиков' },
  page_incidents:        { es: 'Gestión de Incidencias',            ca: "Gestió d'Incidències",             en: 'Incident Management',             fr: 'Gestion des Incidents',                 cs: 'Správa Incidentů',                     ru: 'Управление Инцидентами' },
  page_bess:             { es: 'Monitoreo BESS en Tiempo Real',     ca: 'Monitoratge BESS en Temps Real',    en: 'Real-Time BESS Monitoring',       fr: 'Surveillance BESS en Temps Réel',       cs: 'Monitorování BESS v Reálném Čase',     ru: 'Мониторинг BESS в Реальном Времени' },
  page_bessmap:          { es: 'Mapa BESS España — Estado en Tiempo Real', ca: 'Mapa BESS Espanya — Estat en Temps Real', en: 'BESS Map Spain — Real-Time Status', fr: 'Carte BESS Espagne — État en Temps Réel', cs: 'Mapa BESS Španělsko — Reálný Stav', ru: 'Карта BESS Испания — Режим Реального Времени' },

  // ── Page subtitles ──────────────────────────────────────────────────────────
  sub_dashboard:         { es: 'Estadísticas energéticas en tiempo real e información de red.',                    ca: 'Estadístiques energètiques en temps real i informació de xarxa.',         en: 'Real-time energy statistics and grid information.',                         fr: 'Statistiques énergétiques en temps réel et informations réseau.', cs: 'Energetické statistiky v reálném čase a informace o síti.', ru: 'Энергетическая статистика в реальном времени и информация о сети.' },
  sub_scada:             { es: 'Simulación en tiempo real de nodos de control, PLCs y telemetría de red.',         ca: 'Simulació en temps real de nodes de control, PLCs i telemetria de xarxa.', en: 'Real-time simulation of control nodes, PLCs and network telemetry.',       fr: 'Simulation en temps réel des nœuds de contrôle, PLCs et télémétrie réseau.', cs: 'Simulace řídicích uzlů, PLC a síťové telemetrie v reálném čase.', ru: 'Симуляция узлов управления, ПЛК и сетевой телеметрии в реальном времени.' },
  sub_clients:           { es: 'Listado y registro de clientes vinculados al suministro eléctrico.',               ca: 'Llistat i registre de clients vinculats al subministrament elèctric.',    en: 'List and registration of clients linked to the electrical supply.',         fr: "Liste et enregistrement des clients liés à l'alimentation électrique.", cs: 'Seznam a registrace klientů připojených k elektrické síti.', ru: 'Список и регистрация клиентов, подключенных к энергоснабжению.' },
  sub_meters:            { es: 'Sectores activos y toma de lecturas manuales de consumo.',                         ca: 'Sectors actius i presa de lectures manuals de consum.',                   en: 'Active sectors and manual consumption meter readings.',                     fr: 'Secteurs actifs et relevés manuels de consommation.', cs: 'Aktivní sektory a ruční odečet spotřeby.', ru: 'Активные секторы и ручной ввод показаний потребления.' },
  sub_incidents:         { es: 'Control, reporte y resolución de fallos en contadores.',                           ca: 'Control, informe i resolució de fallades en comptadors.',                 en: 'Control, reporting and resolution of meter faults.',                        fr: 'Contrôle, signalement et résolution des pannes de compteurs.', cs: 'Řízení, hlášení a řešení poruch elektroměrů.', ru: 'Контроль, регистрация и устранение неисправностей счетчиков.' },
  sub_bess:              { es: 'Telemetría en vivo de baterías BESS: carga, voltaje, temperatura y estado de salud.', ca: 'Telemetria en viu de bateries BESS: càrrega, voltatge, temperatura i estat de salut.', en: 'Live BESS battery telemetry: charge, voltage, temperature and health state.', fr: 'Télémétrie en direct des batteries BESS: charge, tension, température et état de santé.', cs: 'Živá telemetrie BESS baterií: nabití, napětí, teplota a stav baterie.', ru: 'Телеметрия батарей BESS в реальном времени: заряд, напряжение, температура и состояние.' },
  sub_bessmap:           { es: 'Vista geográfica del parque de baterías BESS en España: posición, estado y telemetría en vivo.', ca: 'Vista geogràfica del parc de bateries BESS a Espanya: posició, estat i telemetria en viu.', en: 'Geographic view of the BESS battery park in Spain: position, status and live telemetry.', fr: 'Vue géographique du parc de batteries BESS en Espagne: position, état et télémétrie en direct.', cs: 'Geografický pohled na BESS bateriový park ve Španělsku: poloha, stav a živá telemetrie.', ru: 'Географический обзор батарейного парка BESS в Испании: положение, статус и телеметрия.' },

  // ── Sidebar security panel ──────────────────────────────────────────────────
  sidebar_security:      { es: 'Estado de Seguridad (Firewall)', ca: 'Estat de Seguretat (Firewall)',  en: 'Security Status (Firewall)',   fr: 'État de Sécurité (Pare-feu)', cs: 'Stav Bezpečnosti (Firewall)', ru: 'Состояние Безопасности (Файрвол)' },
  sidebar_isolated:      { es: 'AISLADA',                        ca: 'AÏLLADA',                       en: 'ISOLATED',                    fr: 'ISOLÉ',                      cs: 'IZOLOVANÝ',                  ru: 'ИЗОЛИРОВАНА' },
  sidebar_blocked:       { es: 'BLOQUEADO',                      ca: 'BLOQUEJAT',                     en: 'BLOCKED',                     fr: 'BLOQUÉ',                     cs: 'BLOKOVÁNO',                  ru: 'ЗАБЛОКИРОВАНО' },
  sidebar_secure_conn:   { es: 'Conexión Segura Oracle Linux',   ca: 'Connexió Segura Oracle Linux',  en: 'Secure Oracle Linux Connection', fr: 'Connexion Sécurisée Oracle Linux', cs: 'Zabezpečené Připojení Oracle Linux', ru: 'Защищенное Соединение Oracle Linux' },
  sidebar_oracle_subnet: { es: 'Oracle DB Subnet:',              ca: 'Oracle DB Subnet:',             en: 'Oracle DB Subnet:',           fr: 'Sous-réseau Oracle DB:',     cs: 'Oracle DB Podsíť:',           ru: 'Подсеть Oracle DB:' },
  sidebar_internet:      { es: 'Acceso Internet:',               ca: 'Accés Internet:',               en: 'Internet Access:',            fr: 'Accès Internet:',            cs: 'Přístup k Internetu:',       ru: 'Доступ в Интернет:' },
  sidebar_origin:        { es: 'Filtro Origen:',                 ca: 'Filtre Origen:',                en: 'Origin Filter:',              fr: 'Filtre Origine:',            cs: 'Filtr Původu:',              ru: 'Фильтр Источника:' },

  // ── Dashboard KPIs ──────────────────────────────────────────────────────────
  kpi_clients:           { es: 'Clientes',              ca: 'Clients',          en: 'Clients',          fr: 'Clients',          cs: 'Klienti',             ru: 'Клиенты' },
  kpi_active_meters:     { es: 'Contadores Activos',    ca: 'Comptadors Actius', en: 'Active Meters',    fr: 'Compteurs Actifs', cs: 'Aktivní Elektroměry', ru: 'Активные Счетчики' },
  kpi_total_incidents:   { es: 'Total Incidencias',     ca: 'Total Incidències', en: 'Total Incidents',  fr: 'Total Incidents',  cs: 'Celkem Incidentů',    ru: 'Всего Инцидентов' },
  kpi_open_incidents:    { es: 'Incidencias Abiertas',  ca: 'Incidències Obertes', en: 'Open Incidents', fr: 'Incidents Ouverts',cs: 'Otevřené Incidenty',  ru: 'Открытые Инциденты' },

  // ── Dashboard panels ─────────────────────────────────────────────────────────
  dash_monthly_chart:    { es: 'Histórico Mensual de Incidencias', ca: "Historial Mensual d'Incidències", en: 'Monthly Incident History', fr: 'Historique Mensuel des Incidents', cs: 'Měsíční Historie Incidentů', ru: 'Ежемесячная История Инцидентов' },
  dash_production:       { es: 'Operación Directa en Producción',  ca: 'Operació Directa en Producció',  en: 'Direct Production Operation', fr: 'Opération Directe en Production', cs: 'Přímý Provoz v Produkci', ru: 'Прямая Работа в Продакшене' },
  dash_quick_actions:    { es: 'Acciones Rápidas',    ca: 'Accions Ràpides',    en: 'Quick Actions',    fr: 'Actions Rapides',    cs: 'Rychlé Akce',          ru: 'Быстрые Действия' },
  dash_take_reading:     { es: 'Toma de Lectura',     ca: 'Presa de Lectura',   en: 'Take Reading',     fr: 'Relevé de Compteur', cs: 'Odečet Elektroměru',   ru: 'Ввод Показаний' },
  dash_report_incident:  { es: 'Reportar Incidencia', ca: 'Informar Incidència', en: 'Report Incident', fr: 'Signaler un Incident', cs: 'Nahlásit Incident', ru: 'Зарегистрировать Инцидент' },
  dash_add_client:       { es: 'Añadir Cliente',      ca: 'Afegir Client',       en: 'Add Client',      fr: 'Ajouter un Client',  cs: 'Přidat Klienta',      ru: 'Добавить Клиента' },
  month_may:             { es: 'Mayo',   ca: 'Maig',    en: 'May',    fr: 'Mai',     cs: 'Květen',  ru: 'Май' },
  month_june:            { es: 'Junio',  ca: 'Juny',    en: 'June',   fr: 'Juin',    cs: 'Červen',  ru: 'Июнь' },
  month_july:            { es: 'Julio',  ca: 'Juliol',  en: 'July',   fr: 'Juillet', cs: 'Červenec',ru: 'Июль' },

  // ── Clients ──────────────────────────────────────────────────────────────────
  clients_list:          { es: 'Listado General de Clientes',  ca: 'Llistat General de Clients',  en: 'General Client List',     fr: 'Liste Générale des Clients', cs: 'Celkový Seznam Klientů', ru: 'Общий Список Клиентов' },
  client_new:            { es: 'Nuevo Cliente',                ca: 'Nou Client',                  en: 'New Client',              fr: 'Nouveau Client',             cs: 'Nový Klient',            ru: 'Новый Клиент' },
  col_id:                { es: 'ID',            ca: 'ID',              en: 'ID',          fr: 'ID',           cs: 'ID',              ru: 'ID' },
  col_name:              { es: 'Nombre',         ca: 'Nom',             en: 'Name',        fr: 'Nom',          cs: 'Jméno',           ru: 'Имя' },
  col_email:             { es: 'Email',          ca: 'Email',           en: 'Email',       fr: 'Email',        cs: 'E-mail',          ru: 'Эл. почта' },
  col_phone:             { es: 'Teléfono',       ca: 'Telèfon',         en: 'Phone',       fr: 'Téléphone',    cs: 'Telefon',         ru: 'Телефон' },

  // ── Meters ───────────────────────────────────────────────────────────────────
  meters_title:          { es: 'Contadores de Suministro',    ca: 'Comptadors de Subministrament',  en: 'Supply Meters',            fr: "Compteurs d'Alimentation", cs: 'Napájecí Elektroměry', ru: 'Счетчики Энергоснабжения' },
  meter_register:        { es: 'Registrar Contador',          ca: 'Registrar Comptador',            en: 'Register Meter',           fr: 'Enregistrer Compteur',     cs: 'Registrovat Elektroměr', ru: 'Зарегистрировать Счетчики' },
  col_serial:            { es: 'Nº de Serie',   ca: 'Nº de Sèrie',   en: 'Serial No.',   fr: 'N° de Série',   cs: 'Sériové Číslo',   ru: 'Серийный №' },
  col_client:            { es: 'Cliente',        ca: 'Client',         en: 'Client',       fr: 'Client',       cs: 'Klient',          ru: 'Клиент' },
  col_location:          { es: 'Ubicación',      ca: 'Ubicació',       en: 'Location',     fr: 'Emplacement',  cs: 'Umístění',        ru: 'Расположение' },
  col_unknown:           { es: 'Desconocido',    ca: 'Desconegut',     en: 'Unknown',      fr: 'Inconnu',      cs: 'Neznámý',         ru: 'Неизвестно' },

  // ── Incidents ─────────────────────────────────────────────────────────────────
  incidents_history:     { es: 'Historial de Incidencias',    ca: "Historial d'Incidències",       en: 'Incident History',         fr: 'Historique des Incidents', cs: 'Historie Incidentů', ru: 'История Инцидентов' },
  col_meter:             { es: 'Contador',          ca: 'Comptador',       en: 'Meter',            fr: 'Compteur',                 cs: 'Elektroměr',      ru: 'Счетчик' },
  col_date_report:       { es: 'Fecha Reporte',     ca: 'Data Informe',    en: 'Report Date',      fr: 'Date Rapport',             cs: 'Datum Hlášení',   ru: 'Дата Отчета' },
  col_description:       { es: 'Descripción',       ca: 'Descripció',      en: 'Description',      fr: 'Description',              cs: 'Popis',           ru: 'Описание' },
  col_status:            { es: 'Estado',             ca: 'Estat',           en: 'Status',           fr: 'Statut',                   cs: 'Stav',            ru: 'Статус' },
  col_action:            { es: 'Acción',             ca: 'Acció',           en: 'Action',           fr: 'Action',                   cs: 'Akce',            ru: 'Действие' },

  // ── Modals — Client ──────────────────────────────────────────────────────────
  modal_new_client:      { es: 'Registrar Nuevo Cliente',  ca: 'Registrar Nou Client',   en: 'Register New Client',    fr: 'Enregistrer Nouveau Client', cs: 'Registrovat Nového Klienta', ru: 'Регистрация Нового Клиента' },
  label_full_name:       { es: 'Nombre Completo *',        ca: 'Nom Complet *',           en: 'Full Name *',            fr: 'Nom Complet *',               cs: 'Celé Jméno *',              ru: 'Полное Имя *' },
  label_email:           { es: 'Correo Electrónico *',     ca: 'Correu Electrònic *',     en: 'Email Address *',        fr: 'Adresse Email *',             cs: 'E-mailová Adresa *',        ru: 'Адрес Эл. Почты *' },
  label_phone:           { es: 'Teléfono de Contacto',     ca: 'Telèfon de Contacte',     en: 'Contact Phone',          fr: 'Téléphone de Contact',        cs: 'Kontaktní Telefon',         ru: 'Контактный Телефон' },
  btn_save_client:       { es: 'Guardar Cliente',          ca: 'Desar Client',            en: 'Save Client',            fr: 'Enregistrer Client',          cs: 'Uložit Klienta',            ru: 'Сохранить Клиента' },

  // ── Modals — Meter ───────────────────────────────────────────────────────────
  modal_new_meter:       { es: 'Registrar Nuevo Contador',  ca: 'Registrar Nou Comptador',  en: 'Register New Meter',     fr: 'Enregistrer Nouveau Compteur', cs: 'Registrovat Nový Elektroměr', ru: 'Регистрация Нового Счетчика' },
  label_assoc_client:    { es: 'Asociar a Cliente *',       ca: 'Associar a Client *',      en: 'Associate Client *',     fr: 'Associer Client *',             cs: 'Přiřadit ke Klientovi *',     ru: 'Привязать к Клиенту *' },
  label_serial:          { es: 'Número de Serie *',         ca: 'Número de Sèrie *',        en: 'Serial Number *',        fr: 'Numéro de Série *',             cs: 'Sériové Číslo *',             ru: 'Серийный Номер *' },
  label_location:        { es: 'Ubicación *',               ca: 'Ubicació *',               en: 'Location *',             fr: 'Emplacement *',                 cs: 'Umístění *',                  ru: 'Расположение *' },
  btn_reg_meter:         { es: 'Registrar Contador',        ca: 'Registrar Comptador',      en: 'Register Meter',         fr: 'Enregistrer Compteur',          cs: 'Registrovat Elektroměr',      ru: 'Зарегистрировать Счетчик' },
  sel_client_ph:         { es: 'Selecciona un cliente...', ca: 'Selecciona un client...',  en: 'Select a client...',     fr: 'Sélectionner un client...',     cs: 'Vyberte klienta...',          ru: 'Выберите клиента...' },
  sel_meter_ph:          { es: 'Selecciona contador...',   ca: 'Selecciona comptador...',  en: 'Select meter...',        fr: 'Sélectionner compteur...',      cs: 'Vyberte elektroměr...',       ru: 'Выберите счетчик...' },

  // ── Modals — Reading ─────────────────────────────────────────────────────────
  modal_reading:         { es: 'Registrar Toma de Lectura',    ca: 'Registrar Presa de Lectura',  en: 'Register Meter Reading',      fr: 'Enregistrer Relevé de Compteur', cs: 'Zapsat Odečet Elektroměru', ru: 'Ввод Показаний Счетчика' },
  label_sel_meter:       { es: 'Seleccionar Contador *',       ca: 'Seleccionar Comptador *',     en: 'Select Meter *',              fr: 'Sélectionner Compteur *',        cs: 'Vybrat Elektroměr *',        ru: 'Выбрать Счетчик *' },
  label_consumption:     { es: 'Consumo Registrado (KW/h) *',  ca: 'Consum Registrat (KW/h) *',   en: 'Recorded Consumption (KW/h) *', fr: 'Consommation Enregistrée (KW/h) *', cs: 'Nameraná Spotřeba (kWh) *', ru: 'Измеренное Потребление (кВт·ч) *' },
  label_read_date:       { es: 'Fecha de Lectura',             ca: 'Data de Lectura',             en: 'Reading Date',                fr: 'Date de Relevé',                 cs: 'Datum Odečtu',               ru: 'Дата Снятия Показаний' },
  btn_reg_reading:       { es: 'Registrar Lectura',            ca: 'Registrar Lectura',           en: 'Register Reading',            fr: 'Enregistrer Relevé',             cs: 'Uložit Odečet',              ru: 'Записать Показания' },

  // ── Modals — Incident ────────────────────────────────────────────────────────
  modal_new_incident:    { es: 'Reportar Nueva Incidencia',  ca: 'Informar Nova Incidència',   en: 'Report New Incident',     fr: 'Signaler Nouvel Incident', cs: 'Nahlásit Nový Incident', ru: 'Зарегистрировать Новый Инцидент' },
  label_inc_desc:        { es: 'Descripción de la Incidencia *', ca: "Descripció de la Incidència *", en: 'Incident Description *', fr: "Description de l'Incident *", cs: 'Popis Incidentu *', ru: 'Описание Инцидента *' },
  label_report_date:     { es: 'Fecha de Reporte',           ca: "Data d'Informe",             en: 'Report Date',             fr: 'Date du Rapport',          cs: 'Datum Hlášení',          ru: 'Дата Отчета' },
  btn_reg_incident:      { es: 'Registrar Incidencia',       ca: 'Registrar Incidència',       en: 'Register Incident',       fr: 'Enregistrer Incident',     cs: 'Registrovat Incident',   ru: 'Зарегистрировать Инцидент' },
  btn_report_incident:   { es: 'Reportar Incidencia',        ca: 'Informar Incidència',        en: 'Report Incident',         fr: 'Signaler Incident',        cs: 'Nahlásit Incident',      ru: 'Сообщить об Инциденте' },

  // ── Tech View ────────────────────────────────────────────────────────────────
  tech_role:             { es: 'TÉCNICO DE CAMPO',   ca: 'TÈCNIC DE CAMP',  en: 'FIELD TECHNICIAN',  fr: 'TECHNICIEN DE TERRAIN', cs: 'TERÉNNÍ TECHNIK',    ru: 'ПОЛЕВОЙ ТЕХНИК' },
  tech_greeting:         { es: 'Hola',               ca: 'Hola',            en: 'Hello',             fr: 'Bonjour',               cs: 'Ahoj',               ru: 'Привет' },
  tech_summary:          { es: 'Resumen de tu jornada de campo', ca: 'Resum de la teva jornada de camp', en: 'Your field day summary', fr: 'Résumé de votre journée de terrain', cs: 'Přehled vašeho pracovního dne', ru: 'Сводка рабочего дня' },
  tech_open_inc:         { es: 'Incidencias Abiertas', ca: 'Incidències Obertes', en: 'Open Incidents', fr: 'Incidents Ouverts', cs: 'Otevřené Incidenty', ru: 'Открытые Инциденты' },
  tech_meters:           { es: 'Contadores',           ca: 'Comptadors',         en: 'Meters',          fr: 'Compteurs',         cs: 'Elektroměry',        ru: 'Счетчики' },
  tech_quick_actions:    { es: 'Acciones Rápidas',     ca: 'Accions Ràpides',    en: 'Quick Actions',   fr: 'Actions Rapides',   cs: 'Rychlé Akce',        ru: 'Быстрые Действия' },
  tech_report_inc:       { es: 'Reportar Incidencia',  ca: 'Informar Incidència', en: 'Report Incident', fr: 'Signaler un Incident', cs: 'Nahlásit Incident', ru: 'Зарегистрировать Инцидент' },
  tech_report_inc_sub:   { es: 'Registra un fallo en un contador', ca: 'Registra una fallada en un comptador', en: 'Log a meter fault', fr: 'Enregistrer une panne de compteur', cs: 'Zaznamenat poruchu elektroměru', ru: 'Зафиксировать сбой счетчика' },
  tech_reg_meter:        { es: 'Alta de Contador',     ca: 'Alta de Comptador',  en: 'Register Meter',  fr: 'Enregistrer Compteur', cs: 'Registrovat Elektroměr', ru: 'Зарегистрировать Счетчик' },
  tech_reg_meter_sub:    { es: 'Registra un nuevo contador en el sistema', ca: 'Registra un nou comptador al sistema', en: 'Add a new meter to the system', fr: 'Ajouter un nouveau compteur au système', cs: 'Přidat nový elektroměr do systému', ru: 'Добавить новый счетчик в систему' },
  tech_latest_inc:       { es: 'Últimas Incidencias',  ca: 'Últimes Incidències', en: 'Latest Incidents', fr: 'Derniers Incidents', cs: 'Nejnovější Incidenty', ru: 'Последние Инциденты' },
  tech_see_all:          { es: 'Ver todas las incidencias', ca: 'Veure totes les incidències', en: 'See all incidents', fr: 'Voir tous les incidents', cs: 'Zobrazit všechny incidenty', ru: 'Посмотреть все инциденты' },
  tech_no_incidents:     { es: 'Sin incidencias registradas', ca: 'Sense incidències registrades', en: 'No incidents registered', fr: 'Aucun incident enregistré', cs: 'Žádné zaznamenané incidenty', ru: 'Зарегистрированных инцидентов нет' },
  tech_in_system:        { es: 'registrados en el sistema', ca: 'registrats al sistema', en: 'registered in the system', fr: 'enregistrés dans le système', cs: 'registrované v systému', ru: 'зарегистрировано в системе' },
  tech_no_meters:        { es: 'Sin contadores registrados', ca: 'Sense comptadors registrats', en: 'No meters registered', fr: 'Aucun compteur enregistré', cs: 'Žádné registrované elektroměry', ru: 'Зарегистрированных счетчиков нет' },
  tech_deregister:       { es: 'Dar de Baja',      ca: 'Donar de Baixa', en: 'Deregister',  fr: 'Désinscrire', cs: 'Odregistrovat', ru: 'Снять с учета' },
  tech_confirm_title:    { es: '⚠️ Confirmar Baja', ca: '⚠️ Confirmar Baixa', en: '⚠️ Confirm Deregistration', fr: '⚠️ Confirmer la Désinscription', cs: '⚠️ Potvrdit Odregistraci', ru: '⚠️ Подтвердить Снятие' },
  tech_confirm_msg:      { es: '¿Estás seguro de que quieres dar de baja el contador', ca: 'Estàs segur que vols donar de baixa el comptador', en: 'Are you sure you want to deregister meter', fr: 'Êtes-vous sûr de vouloir désinscrire le compteur', cs: 'Opravdu chcete odregistrovat elektroměr', ru: 'Вы уверены, что хотите снять с учета счетчик' },
  tech_confirm_irrev:    { es: '? Esta acción no se puede deshacer.', ca: '? Aquesta acció no es pot desfer.', en: '? This action cannot be undone.', fr: '? Cette action ne peut pas être annulée.', cs: '? Tuto akci nelze vrátit zpět.', ru: '? Это действие нельзя отменить.' },
  tech_nav_home:         { es: 'Inicio',         ca: 'Inici',         en: 'Home',        fr: 'Accueil',     cs: 'Domů',         ru: 'Главная' },
  tech_btn_submit:       { es: '⚠️ REPORTAR INCIDENCIA', ca: '⚠️ INFORMAR INCIDÈNCIA', en: '⚠️ REPORT INCIDENT', fr: '⚠️ SIGNALER INCIDENT', cs: '⚠️ NAHLÁSIT INCIDENT', ru: '⚠️ СООБЩИТЬ ОБ ИНЦИДЕНТЕ' },
  tech_btn_sending:      { es: 'Enviando...',    ca: 'Enviant...',    en: 'Sending...',  fr: 'Envoi...',    cs: 'Odesílání...',  ru: 'Отправка...' },
  tech_btn_register:     { es: '📟 DAR DE ALTA CONTADOR', ca: "📟 DONAR D'ALTA COMPTADOR", en: '📟 REGISTER METER', fr: '📟 ENREGISTRER COMPTEUR', cs: '📟 REGISTROVAT ELEKTROMĚR', ru: '📟 ЗАРЕГИСТРИРОВАТЬ СЧЕТЧИК' },
  tech_btn_registering:  { es: 'Registrando...', ca: 'Registrant...', en: 'Registering...', fr: 'Enregistrement...', cs: 'Registrace...', ru: 'Регистрация...' },
  tech_label_meter:      { es: 'Contador *',     ca: 'Comptador *',   en: 'Meter *',     fr: 'Compteur *',  cs: 'Elektroměr *', ru: 'Счетчик *' },
  tech_label_desc:       { es: 'Descripción de la Incidencia *', ca: "Descripció de la Incidència *", en: 'Incident Description *', fr: "Description de l'Incident *", cs: 'Popis Incidentu *', ru: 'Описание Инцидента *' },
  tech_label_date:       { es: 'Fecha de Reporte', ca: "Data d'Informe", en: 'Report Date', fr: 'Date du Rapport', cs: 'Datum Hlášení', ru: 'Дата Отчета' },
  tech_label_serial:     { es: 'Número de Serie *', ca: 'Número de Sèrie *', en: 'Serial Number *', fr: 'Numéro de Série *', cs: 'Sériové Číslo *', ru: 'Серийный Номер *' },
  tech_label_location:   { es: 'Ubicación',      ca: 'Ubicació',      en: 'Location',    fr: 'Emplacement', cs: 'Umístění',     ru: 'Расположение' },
  tech_label_client:     { es: 'Asociar a Cliente *', ca: 'Associar a Client *', en: 'Associate Client *', fr: 'Associer Client *', cs: 'Přiřadit ke Klientovi *', ru: 'Привязать к Клиенту *' },

  // ── BESS Map ─────────────────────────────────────────────────────────────────
  bess_map_title:        { es: 'Parque BESS Nacional', ca: 'Parc BESS Nacional', en: 'National BESS Park', fr: 'Parc BESS National', cs: 'Národní BESS Park', ru: 'Национальный Парк BESS' },
  bess_map_sub:          { es: 'Estado en tiempo real · Datos Oracle DB', ca: 'Estat en temps real · Dades Oracle DB', en: 'Real-time status · Oracle DB Data', fr: 'État en temps réel · Données Oracle DB', cs: 'Reálný stav · Data Oracle DB', ru: 'Режим реального времени · Данные Oracle DB' },
  bess_map_sub_demo:     { es: 'Modo Demostración · Datos Simulados', ca: 'Mode Demostració · Dades Simulades', en: 'Demo Mode · Simulated Data', fr: 'Mode Démonstration · Données Simulées', cs: 'Demo Režim · Simulovaná Data', ru: 'Демо Режим · Симулированные Данные' },
  bess_installations:    { es: 'Instalaciones BESS', ca: 'Instal·lacions BESS', en: 'BESS Installations', fr: 'Installations BESS', cs: 'Instalace BESS', ru: 'Установки BESS' },
  bess_select:           { es: 'Selecciona una instalación del mapa', ca: "Selecciona una instal·lació del mapa", en: 'Select an installation from the map', fr: 'Sélectionner une installation sur la carte', cs: 'Vyberte instalaci z mapy', ru: 'Выберите установку на карте' },
  bess_pinned:           { es: '📌 INFORMACIÓN FIJADA', ca: '📌 INFORMACIÓ FIXADA', en: '📌 PINNED INFO', fr: '📌 INFO ÉPINGLÉE', cs: '📌 PRIPNUTÉ INFORMACE', ru: '📌 ЗАКРЕПЛЕННАЯ ИНФОРМАЦИЯ' },
  bess_click_pin:        { es: 'Clic para fijar · ESC para cerrar', ca: 'Clic per fixar · ESC per tancar', en: 'Click to pin · ESC to close', fr: 'Cliquer pour épingler · ESC pour fermer', cs: 'Kliknutím připnete · ESC zavřít', ru: 'Клик — закрепить · ESC — закрыть' },
  bess_state:            { es: 'Estado',    ca: 'Estat',     en: 'Status',   fr: 'État',     cs: 'Stav',     ru: 'Статус' },
  bess_soc:              { es: 'SOC',       ca: 'SOC',       en: 'SOC',      fr: 'SOC',      cs: 'SOC',      ru: 'SOC' },
  bess_power:            { es: 'Potencia',  ca: 'Potència',  en: 'Power',    fr: 'Puissance',cs: 'Výkon',    ru: 'Мощность' },
  bess_voltage:          { es: 'Voltaje',   ca: 'Voltatge',  en: 'Voltage',  fr: 'Tension',  cs: 'Napětí',   ru: 'Напряжение' },
  bess_temp:             { es: 'Temp.',     ca: 'Temp.',     en: 'Temp.',    fr: 'Temp.',    cs: 'Teplota',  ru: 'Темп.' },
  bess_freq:             { es: 'Frec.',     ca: 'Freq.',     en: 'Freq.',    fr: 'Fréq.',    cs: 'Frekvence',ru: 'Частота' },
  bess_duration:         { es: 'Duración',  ca: 'Durada',    en: 'Duration', fr: 'Durée',    cs: 'Doba',     ru: 'Длительность' },
  bess_conn_point:       { es: 'Punto de Conexión', ca: 'Punt de Connexió', en: 'Connection Point', fr: 'Point de Connexion', cs: 'Bod Připojení', ru: 'Точка Подключения' },
  bess_valley:           { es: '🌙 Hora Valle',  ca: '🌙 Hora Vall',    en: '🌙 Off-Peak Hour', fr: '🌙 Heure Creuse', cs: '🌙 Mimo Špičku', ru: '🌙 Ночной Тариф' },
  bess_peak:             { es: '☀️ Hora Punta',  ca: '☀️ Hora Punta',  en: '☀️ Peak Hour',     fr: '☀️ Heure de Pointe', cs: '☀️ Ve Špičce', ru: '☀️ Пиковый Тариф' },
  bess_allow_charge:     { es: '✅ Permite Cargar',       ca: '✅ Permet Carregar',      en: '✅ Charging Allowed',   fr: '✅ Charge Autorisée', cs: '✅ Nabíjení Povoleno', ru: '✅ Зарядка Разрешена' },
  bess_no_charge:        { es: '🚫 Sin Carga',            ca: '🚫 Sense Càrrega',        en: '🚫 No Charge',          fr: '🚫 Pas de Charge', cs: '🚫 Bez Nabíjení', ru: '🚫 Зарядка Запрещена' },
  bess_allow_supply:     { es: '✅ Permite Suministrar',  ca: '✅ Permet Subministrar',  en: '✅ Supply Allowed',     fr: '✅ Fourniture Autorisée', cs: '✅ Dodávka Povolena', ru: '✅ Выдача Разрешена' },
  bess_no_supply:        { es: '🚫 Sin Suministro',       ca: '🚫 Sense Subministrament', en: '🚫 No Supply',         fr: '🚫 Pas de Fourniture', cs: '🚫 Bez Dodávky', ru: '🚫 Выдача Запрещена' },
  bess_charging:         { es: 'CARGANDO',        ca: 'CARREGANT',       en: 'CHARGING',    fr: 'EN CHARGE', cs: 'NABÍJENÍ', ru: 'ЗАРЯДКА' },
  bess_supplying:        { es: 'SUMINISTRANDO',   ca: 'SUBMINISTRANT',   en: 'SUPPLYING',   fr: 'ALIMENTATION', cs: 'DODÁVÁNÍ', ru: 'ВЫДАЧА' },
  bess_standby:          { es: 'STANDBY',         ca: 'STANDBY',         en: 'STANDBY',     fr: 'VEILLE',    cs: 'POHOTOVOST', ru: 'ОЖИДАНИЕ' },
  bess_leg_charging:     { es: 'Cargando',        ca: 'Carregant',       en: 'Charging',    fr: 'En charge', cs: 'Nabíjení', ru: 'Зарядка' },
  bess_leg_supplying:    { es: 'Suministrando',   ca: 'Subministrant',   en: 'Supplying',   fr: 'Alimentation', cs: 'Dodávání', ru: 'Выдача' },
  bess_leg_standby:      { es: 'Standby',         ca: 'Standby',         en: 'Standby',     fr: 'Veille',    cs: 'Pohotovost', ru: 'Ожидание' },

  // ── BESS Monitoring ──────────────────────────────────────────────────────────
  bess_mon_loading:      { es: 'Cargando telemetría BESS...', ca: 'Carregant telemetria BESS...', en: 'Loading BESS telemetry...', fr: 'Chargement télémétrie BESS...', cs: 'Načítání telemetrie BESS...', ru: 'Загрузка телеметрии BESS...' },
  bess_mon_unit:         { es: 'Unidad',  ca: 'Unitat',  en: 'Unit',    fr: 'Unité',   cs: 'Jednotka', ru: 'Блок' },
  bess_mon_all:          { es: 'Todas',   ca: 'Totes',   en: 'All',     fr: 'Toutes',  cs: 'Všechny',  ru: 'Все' },
  bess_mon_history:      { es: 'Histórico', ca: 'Historial', en: 'History', fr: 'Historique', cs: 'Historie', ru: 'История' },
  bess_mon_days:         { es: 'días',    ca: 'dies',    en: 'days',    fr: 'jours',   cs: 'dní',      ru: 'дней' },
  bess_last_update:      { es: 'Última actualización:', ca: 'Última actualització:', en: 'Last update:', fr: 'Dernière mise à jour:', cs: 'Poslední aktualizace:', ru: 'Последнее обновление:' },
  bess_demo_banner:      { es: '🟡 MODO DEMOSTRACIÓN — Sin conexión a Oracle DB. Mostrando datos simulados representativos.', ca: '🟡 MODE DEMOSTRACIÓ — Sense connexió a Oracle DB. Mostrant dades simulades representatives.', en: '🟡 DEMO MODE — No Oracle DB connection. Showing representative simulated data.', fr: '🟡 MODE DÉMONSTRATION — Pas de connexion Oracle DB. Affichage de données simulées.', cs: '🟡 DEMO REŽIM — Bez připojení k Oracle DB. Zobrazená simulovaná data.', ru: '🟡 ДЕМО РЕЖИМ — Нет подключения к Oracle DB. Показ симулированных данных.' },
  bess_oracle_banner:    { es: '🟢 CONECTADO A ORACLE DB — Datos en tiempo real desde servidor Oracle DB', ca: '🟢 CONNECTAT A ORACLE DB — Dades en temps real des de servidor Oracle DB', en: '🟢 CONNECTED TO ORACLE DB — Real-time data from Oracle DB server', fr: '🟢 CONNECTÉ À ORACLE DB — Données en temps réel depuis le serveur Oracle DB', cs: '🟢 PŘIPOJENO K ORACLE DB — Data v reálném čase z Oracle DB', ru: '🟢 ПОДКЛЮЧЕНО К ORACLE DB — Данные в реальном времени из Oracle DB' },
} as const;

export type TranslationKey = keyof typeof translations;

// Create a translation function bound to a specific language
export function makeT(lang: Lang) {
  return function t(key: TranslationKey): string {
    const entry = translations[key] as Record<Lang, string> | undefined;
    if (!entry) return key;
    return entry[lang] ?? entry['es'] ?? key;
  };
}
