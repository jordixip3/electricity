-- =============================================================
-- V3__create_electricidad_tables.sql
-- Tablas principales del sistema de electricidad
-- Ejecutar como APP_ELECTRICIDAD en Oracle ORCLPDB1
-- =============================================================

-- ── SECUENCIAS ────────────────────────────────────────────────
CREATE SEQUENCE SEQ_CLIENTE     START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_PLC         START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_MEDIDOR     START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_LECTURA     START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_INCIDENCIA  START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ── CLIENTE ───────────────────────────────────────────────────
CREATE TABLE CLIENTE (
    id          NUMBER(19,0)  NOT NULL,
    nombre      VARCHAR2(255) NOT NULL,
    email       VARCHAR2(255) NOT NULL,
    fecha_alta  DATE          NOT NULL,
    CONSTRAINT pk_cliente PRIMARY KEY (id),
    CONSTRAINT uq_cliente_email UNIQUE (email)
);

-- ── PLC ────────────────────────────────────────────────────────
CREATE TABLE PLC (
    id               NUMBER(19,0)  NOT NULL,
    nombre           VARCHAR2(255) NOT NULL,
    ip               VARCHAR2(255) NOT NULL,
    estado           VARCHAR2(255) NOT NULL,
    ubicacion        VARCHAR2(255) NOT NULL,
    ultima_conexion  TIMESTAMP,
    CONSTRAINT pk_plc PRIMARY KEY (id)
);

-- ── MEDIDOR ───────────────────────────────────────────────────
CREATE TABLE MEDIDOR (
    id               NUMBER(19,0)  NOT NULL,
    numero_serie     VARCHAR2(255) NOT NULL,
    cliente_id       NUMBER(19,0)  NOT NULL,
    plc_id           NUMBER(19,0),
    activo           NUMBER(1,0)   NOT NULL,   -- boolean: 1=true, 0=false
    estado_conexion  VARCHAR2(20),
    voltaje          BINARY_DOUBLE,
    corriente        BINARY_DOUBLE,
    potencia         BINARY_DOUBLE,
    frecuencia       BINARY_DOUBLE,
    temperatura      BINARY_DOUBLE,
    CONSTRAINT pk_medidor PRIMARY KEY (id),
    CONSTRAINT uq_medidor_serie UNIQUE (numero_serie),
    CONSTRAINT fk_medidor_cliente FOREIGN KEY (cliente_id) REFERENCES CLIENTE (id),
    CONSTRAINT fk_medidor_plc    FOREIGN KEY (plc_id)     REFERENCES PLC (id)
);

-- ── LECTURA ───────────────────────────────────────────────────
CREATE TABLE LECTURA (
    id              NUMBER(19,0)   NOT NULL,
    medidor_id      NUMBER(19,0)   NOT NULL,
    consumo         BINARY_DOUBLE  NOT NULL,
    fecha_lectura   DATE           NOT NULL,
    soc             BINARY_DOUBLE,
    voltaje         BINARY_DOUBLE,
    corriente       BINARY_DOUBLE,
    potencia        BINARY_DOUBLE,
    frecuencia      BINARY_DOUBLE,
    temperatura     BINARY_DOUBLE,
    CONSTRAINT pk_lectura PRIMARY KEY (id),
    CONSTRAINT fk_lectura_medidor FOREIGN KEY (medidor_id) REFERENCES MEDIDOR (id)
);

-- ── INCIDENCIA ────────────────────────────────────────────────
CREATE TABLE INCIDENCIA (
    id                NUMBER(19,0)  NOT NULL,
    medidor_id        NUMBER(19,0)  NOT NULL,
    fecha_incidencia  DATE          NOT NULL,
    descripcion       VARCHAR2(500),
    estado            VARCHAR2(20),
    CONSTRAINT pk_incidencia PRIMARY KEY (id),
    CONSTRAINT fk_incidencia_medidor FOREIGN KEY (medidor_id) REFERENCES MEDIDOR (id)
);

-- ── DATOS DE MUESTRA ──────────────────────────────────────────
INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
VALUES (SEQ_CLIENTE.NEXTVAL, 'Industrias Solares S.L.',  'info@industriassolares.com',  DATE '2024-01-15');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
VALUES (SEQ_CLIENTE.NEXTVAL, 'Comercial Energía Verde', 'contacto@energiaverde.es',    DATE '2024-03-22');

INSERT INTO CLIENTE (id, nombre, email, fecha_alta)
VALUES (SEQ_CLIENTE.NEXTVAL, 'Residencial Parque Norte', 'admin@parquenorte.es',        DATE '2024-06-01');

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
VALUES (SEQ_PLC.NEXTVAL, 'PLC-NAVE-A', '192.168.10.10', 'ACTIVO',    'Nave Industrial A', SYSTIMESTAMP);

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
VALUES (SEQ_PLC.NEXTVAL, 'PLC-NAVE-B', '192.168.10.11', 'ACTIVO',    'Nave Industrial B', SYSTIMESTAMP);

INSERT INTO PLC (id, nombre, ip, estado, ubicacion, ultima_conexion)
VALUES (SEQ_PLC.NEXTVAL, 'PLC-OFICINA', '192.168.10.20', 'INACTIVO', 'Oficinas Centrales', SYSTIMESTAMP - INTERVAL '2' HOUR);

INSERT INTO MEDIDOR (id, numero_serie, cliente_id, plc_id, activo, estado_conexion, voltaje, corriente, potencia, frecuencia, temperatura)
VALUES (SEQ_MEDIDOR.NEXTVAL, 'MED-2024-001', 1, 1, 1, 'CONECTADO', 230.5, 15.2, 3.51, 50.02, 38.5);

INSERT INTO MEDIDOR (id, numero_serie, cliente_id, plc_id, activo, estado_conexion, voltaje, corriente, potencia, frecuencia, temperatura)
VALUES (SEQ_MEDIDOR.NEXTVAL, 'MED-2024-002', 1, 1, 1, 'CONECTADO', 229.8, 12.7, 2.92, 49.98, 37.2);

INSERT INTO MEDIDOR (id, numero_serie, cliente_id, plc_id, activo, estado_conexion, voltaje, corriente, potencia, frecuencia, temperatura)
VALUES (SEQ_MEDIDOR.NEXTVAL, 'MED-2024-003', 2, 2, 1, 'CONECTADO', 231.0, 18.5, 4.27, 50.00, 39.8);

INSERT INTO MEDIDOR (id, numero_serie, cliente_id, plc_id, activo, estado_conexion, voltaje, corriente, potencia, frecuencia, temperatura)
VALUES (SEQ_MEDIDOR.NEXTVAL, 'MED-2024-004', 3, 3, 1, 'DESCONECTADO', 0, 0, 0, 50.0, 25.0);

-- Lecturas históricas
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 1, 1250.5, DATE '2026-06-01', 230.2, 15.1, 3.48, 50.01);
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 1, 1380.2, DATE '2026-07-01', 230.5, 15.3, 3.52, 50.02);
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 2, 980.7,  DATE '2026-06-01', 229.7, 12.5, 2.87, 49.97);
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 2, 1050.3, DATE '2026-07-01', 229.9, 12.8, 2.94, 49.99);
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 3, 2100.0, DATE '2026-06-01', 230.9, 18.4, 4.25, 50.00);
INSERT INTO LECTURA (id, medidor_id, consumo, fecha_lectura, voltaje, corriente, potencia, frecuencia)
VALUES (SEQ_LECTURA.NEXTVAL, 3, 2350.8, DATE '2026-07-01', 231.1, 18.6, 4.30, 50.01);

-- Incidencias de ejemplo
INSERT INTO INCIDENCIA (id, medidor_id, fecha_incidencia, descripcion, estado)
VALUES (SEQ_INCIDENCIA.NEXTVAL, 4, DATE '2026-07-15', 'Pérdida de conexión detectada - revisión programada', 'ABIERTA');
INSERT INTO INCIDENCIA (id, medidor_id, fecha_incidencia, descripcion, estado)
VALUES (SEQ_INCIDENCIA.NEXTVAL, 1, DATE '2026-05-10', 'Fluctuación de voltaje registrada. Revisada y normalizada.', 'RESUELTA');

COMMIT;
