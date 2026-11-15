-- =============================================================
-- V4__expand_demo_topology_data.sql
-- Ampliación de datos demo para la topología de red eléctrica
-- =============================================================

-- Insertar más Clientes corporativos e industriales
INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
SELECT SEQ_CLIENTE.NEXTVAL, 'Parque Solar Alfa 50MW', 'operaciones@solaralfa.es', DATE '2024-02-10' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE email = 'operaciones@solaralfa.es');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
SELECT SEQ_CLIENTE.NEXTVAL, 'Datacenter Iberia Cloud', 'ops@datacenteriberia.com', DATE '2024-04-18' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE email = 'ops@datacenteriberia.com');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
SELECT SEQ_CLIENTE.NEXTVAL, 'Hospital Universitario Central', 'infraestructura@hosp-central.es', DATE '2024-05-01' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE email = 'infraestructura@hosp-central.es');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
SELECT SEQ_CLIENTE.NEXTVAL, 'Planta Química QuimiNor', 'mantenimiento@quiminor.es', DATE '2024-07-12' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE email = 'mantenimiento@quiminor.es');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
SELECT SEQ_CLIENTE.NEXTVAL, 'Red Electrolineras EV-Hub', 'red@evhubcharge.es', DATE '2024-08-20' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE email = 'red@evhubcharge.es');

-- Insertar más Controladores PLC
INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
SELECT SEQ_PLC.NEXTVAL, 'PLC-SUBESTACION-NORTE', '192.168.10.10', 'ONLINE', 'Subestación Alta Tensión 400kV', SYSTIMESTAMP FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PLC WHERE nombre = 'PLC-SUBESTACION-NORTE');

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
SELECT SEQ_PLC.NEXTVAL, 'PLC-SUBESTACION-SUR', '192.168.10.11', 'ONLINE', 'Subestación Transformadora Sur 220kV', SYSTIMESTAMP FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PLC WHERE nombre = 'PLC-SUBESTACION-SUR');

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
SELECT SEQ_PLC.NEXTVAL, 'PLC-BESS-RACK-01', '192.168.10.15', 'ONLINE', 'Banco BESS Baterías Ion-Litio', SYSTIMESTAMP FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PLC WHERE nombre = 'PLC-BESS-RACK-01');

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
SELECT SEQ_PLC.NEXTVAL, 'PLC-PARQUE-SOLAR', '192.168.10.20', 'ONLINE', 'Parque Fotovoltaico Alfa 50MW', SYSTIMESTAMP FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PLC WHERE nombre = 'PLC-PARQUE-SOLAR');

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
SELECT SEQ_PLC.NEXTVAL, 'PLC-DATA-CENTER', '192.168.10.25', 'ONLINE', 'Anillo Red Crítica Datacenter', SYSTIMESTAMP FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PLC WHERE nombre = 'PLC-DATA-CENTER');

COMMIT;
