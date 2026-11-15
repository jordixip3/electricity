# Proyecto Electricidad

Este es un proyecto web dockerizado para la gestión de consumo de electricidad y facturación. El sistema está implementado con un backend en **Spring Boot + Hibernate (JPA)** y un frontend en **React + TypeScript (Vite)**. La base de datos es **Oracle Database**.

---

## 🔒 Arquitectura de Seguridad (Firewall y Redes)

Para cumplir con el requisito de que **la base de datos Oracle sea inaccesible desde Internet** y **únicamente pueda conectarse con la aplicación web**, hemos estructurado las redes internas de Docker de la siguiente forma:

1. **Segmentación de Redes (Subredes)**:
   - **`frontend-net`**: Conecta el navegador del usuario final con el contenedor del **Frontend** (Nginx) y con el **Backend** (Spring Boot).
   - **`backend-net`**: Conecta de forma privada y exclusiva al **Backend** (Spring Boot) con la base de datos **Oracle**. El contenedor frontend no tiene acceso a esta red.
2. **Aislamiento Total de Puertos**:
   - El servicio `oracle-db` en el archivo `docker-compose.yml` **no define la sección `ports`**. Esto significa que el puerto `1521` de la base de datos no se expone a la máquina anfitrión (host) ni a Internet. Solo es accesible para los contenedores que forman parte de la red `backend-net`.
3. **Servidor Puente Seguro (Backend)**:
   - El contenedor `backend` es el único que pertenece a ambas subredes (`frontend-net` y `backend-net`), funcionando como la única pasarela de comunicación con la base de datos.
4. **Proxy Inverso en el Frontend**:
   - El contenedor `frontend` (Nginx) actúa como único punto de entrada para los usuarios en el puerto `8181`. Redirige las llamadas `/api/*` de forma transparente hacia el backend en su puerto privado `8080`, manteniendo el backend oculto del acceso directo a internet si se desea.

```
       [ INTERNET / MÁQUINA FÍSICA ]
                    │
                    ▼ (Puerto 8181)
┌──────────────────────────────────────────────┐
│            DOCKER HOST NETWORK               │
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │ Subred: frontend-net                 │   │
│   │                                      │   │
│   │   [Contenedor: frontend (Nginx)]     │   │
│   │                 │                    │   │
│   │                 ▼ (/api proxy)       │   │
│   │   [Contenedor: backend (Spring)]     │   │
│   │                 │                    │   │
│   └─────────────────┼────────────────────┘   │
│                     │                        │
│   ┌─────────────────┼────────────────────┐   │
│   │ Subred: backend-net                  │   │
│   │                 │                    │   │
│   │                 ▼ (JDBC Port 1521)   │   │
│   │   [Contenedor: oracle-db (Oracle)]   │   │
│   │                                      │   │
│   └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🚀 Cómo Iniciar la Aplicación

Para construir y levantar todo el ecosistema (Frontend, Backend, Oracle DB):

```bash
docker compose build
docker compose up -d
```

> **Nota**: La base de datos Oracle tarda aproximadamente 1-2 minutos en inicializarse por completo en el primer arranque. El backend de Spring Boot esperará y se reintentará conectar. Una vez conectada, la base de datos se poblará automáticamente con datos de prueba realistas (clientes, contadores, facturas e historial de consumo de 4 meses).

### Acceso a la Interfaz de Usuario
- **URL**: [http://localhost:8181](http://localhost:8181)

---

## 🛠️ Verificación del Firewall (Aislamiento)

Puedes verificar el aislamiento de la base de datos Oracle ejecutando las siguientes pruebas:

### 1. Intento de acceso desde el exterior (Tu Máquina Host)
Comprueba si el puerto de Oracle está abierto en tu ordenador local:
```bash
nc -zv localhost 1521
# o bien
telnet localhost 1521
```
*Resultado esperado*: **Conexión rechazada o Time Out**. El puerto no está expuesto fuera de Docker.

### 2. Intento de acceso desde el Contenedor Frontend
Accede al contenedor del frontend e intenta conectar a la base de datos:
```bash
docker compose exec frontend ping oracle-db
# o bien
docker compose exec frontend wget http://oracle-db:1521
```
*Resultado esperado*: **Fallo de resolución de host o red inaccesible**. El contenedor frontend no tiene acceso a `backend-net`.

### 3. Acceso autorizado desde el Contenedor Backend
Accede al contenedor del backend y comprueba la conexión a la base de datos:
```bash
docker compose exec backend nc -zv oracle-db 1521
```
*Resultado esperado*: **Connection successful!** (o similar). El backend sí tiene acceso porque pertenece a `backend-net`.
