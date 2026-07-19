# SCADA Setup Guide

## What is SCADA?

SCADA (Supervisory Control and Data Acquisition) is a system for monitoring and controlling industrial processes. The Electricity SCADA system provides:

- **Real-time monitoring** of electrical systems
- **Remote control** of equipment and processes
- **Alarm management** and alerts
- **Historical data** collection and analysis
- **Dashboards** for visualization

## Initial Setup

### 1. System Requirements

**Hardware**:
- Processor: Intel Core i5 or equivalent
- Memory: 8GB RAM minimum (16GB recommended)
- Storage: 50GB SSD for database
- Network: 1Gbps Ethernet

**Software**:
- Java 11 or higher
- PostgreSQL 12+ or MySQL 8.0+
- Docker (optional, for containerization)

### 2. Installation

#### Option A: Standalone Installation

```bash
# Clone repository
git clone https://github.com/jordixip3/electricity.git
cd electricity

# Build application
mvn clean package -DskipTests

# Run application
java -jar target/electricity-1.0.0.jar
```

#### Option B: Docker Installation

```bash
# Build Docker image
docker build -t electricity:latest .

# Run with docker-compose
docker-compose up -d
```

#### Option C: Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n electricity
```

### 3. Database Setup

#### PostgreSQL

```sql
-- Create database
CREATE DATABASE electricity_db;

-- Create user
CREATE USER electricity_user WITH PASSWORD 'secure_password';

-- Grant permissions
ALTER ROLE electricity_user WITH CREATEDB;
GRANT CONNECT ON DATABASE electricity_db TO electricity_user;
GRANT USAGE ON SCHEMA public TO electricity_user;
GRANT CREATE ON SCHEMA public TO electricity_user;

-- Connect and create tables (automatic on first run)
```

#### MySQL

```sql
-- Create database
CREATE DATABASE electricity_db;

-- Create user
CREATE USER 'electricity_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON electricity_db.* TO 'electricity_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configuration

#### Main Configuration File

Create `application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/electricity

# Database - PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/electricity_db
spring.datasource.username=electricity_user
spring.datasource.password=secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL12Dialect
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.root=INFO
logging.level.com.electricity=DEBUG
logging.file.name=logs/electricity.log
logging.file.max-size=10MB
logging.file.max-history=30

# SCADA Settings
scada.system.name=Main_SCADA_System
scada.monitoring.enabled=true
scada.monitoring.interval=5000
scada.alarm.enabled=true

# PLC Configuration
plc.connection.timeout=10000
plc.connection.retry.attempts=3
plc.connection.retry.delay=5000

# Security
security.jwt.secret=your-secret-key-here
security.jwt.expiration=86400000
security.cors.enabled=true
security.cors.allowed-origins=*
```

#### Environment-Specific Profiles

**application-prod.properties**:
```properties
server.port=8443
server.ssl.key-store=/etc/electricity/keystore.jks
server.ssl.key-store-password=${KEYSTORE_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.hikari.maximum-pool-size=20
logging.level.com.electricity=WARN
```

**application-dev.properties**:
```properties
server.port=8080
spring.jpa.hibernate.ddl-auto=create-drop
spring.datasource.hikari.maximum-pool-size=5
logging.level.com.electricity=DEBUG
```

### 5. Start SCADA Service

```bash
# Development mode
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Production mode
java -jar electricity-1.0.0.jar --spring.profiles.active=prod
```

## Adding SCADA Sites/Systems

A SCADA system can monitor multiple sites. Add sites through the API or configuration file.

### Via API

```bash
# Create new site
curl -X POST http://localhost:8080/electricity/api/scada/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Production_Facility_A",
    "location": "Plant Building 1",
    "description": "Main production line SCADA",
    "enabled": true,
    "timezone": "Europe/Madrid",
    "coordinates": {
      "latitude": 40.4168,
      "longitude": -3.7038
    }
  }'
```

### Via Configuration File

Create `scada-sites.yaml`:

```yaml
sites:
  - id: site-001
    name: Production_Facility_A
    location: Plant Building 1
    timezone: Europe/Madrid
    enabled: true
    devices:
      - id: plc-001
        name: Main_Production_Line
        type: SIEMENS_S7
        ipAddress: 192.168.1.50
      - id: plc-002
        name: Backup_Production_Line
        type: MODBUS
        ipAddress: 192.168.1.51
    
  - id: site-002
    name: Distribution_Center
    location: Distribution Hub
    timezone: Europe/Madrid
    enabled: true
```

## SCADA Monitoring

### 1. Real-Time Monitoring Dashboard

Access dashboard at: `http://localhost:8080/electricity/dashboard`

**Features**:
- Real-time data visualization
- Live equipment status
- Active alarms
- System health metrics

### 2. Data Collection

The system automatically collects:
- Sensor readings from PLCs
- Equipment status changes
- Alarm events
- System events
- User actions

### 3. View Real-Time Data

```bash
# Get current system status
curl http://localhost:8080/electricity/api/scada/status

# Get data for specific site
curl http://localhost:8080/electricity/api/scada/sites/site-001/data

# Get real-time alerts
curl http://localhost:8080/electricity/api/scada/alarms?state=ACTIVE
```

## Alarm Configuration

### Define Alarm Rules

Create `alarms.yaml`:

```yaml
alarms:
  - id: HIGH_TEMPERATURE
    name: High Temperature Alert
    description: Temperature exceeds safe operating limit
    severity: CRITICAL
    source: temperature_sensor
    rules:
      - condition: "value > 95"
        action: RAISE_ALARM
      - condition: "value < 85"
        action: CLEAR_ALARM
    notifications:
      - type: EMAIL
        recipients:
          - operator@company.com
          - supervisor@company.com
      - type: SMS
        recipients:
          - +34666555444
      - type: DASHBOARD
        enabled: true

  - id: PUMP_FAILURE
    name: Pump Failure Detected
    description: Pump is not responding
    severity: HIGH
    source: pump_status
    rules:
      - condition: "isOffline()"
        action: RAISE_ALARM
    notifications:
      - type: EMAIL
        recipients:
          - maintenance@company.com
      - type: WEBHOOK
        url: https://incident-management.company.com/api/incidents

  - id: LOW_PRESSURE
    name: Low Pressure Warning
    description: System pressure below minimum threshold
    severity: WARNING
    source: pressure_sensor
    rules:
      - condition: "value < 30"
        action: RAISE_ALARM
```

### Configure Alarm Thresholds

```bash
# Update alarm threshold via API
curl -X PUT http://localhost:8080/electricity/api/scada/alarms/HIGH_TEMPERATURE/threshold \
  -H "Content-Type: application/json" \
  -d '{
    "threshold": 90,
    "severity": "CRITICAL"
  }'
```

### Manage Alarms

```bash
# Get active alarms
curl http://localhost:8080/electricity/api/scada/alarms?state=ACTIVE

# Acknowledge alarm
curl -X POST http://localhost:8080/electricity/api/scada/alarms/ALARM_ID/acknowledge \
  -d '{"acknowledgedBy": "operator@company.com", "comment": "Issue identified"}'

# Clear alarm
curl -X POST http://localhost:8080/electricity/api/scada/alarms/ALARM_ID/clear
```

## Historical Data

### Data Retention Policy

```properties
# Data retention settings
scada.data.retention.enabled=true
scada.data.retention.days=365
scada.data.retention.aggregate-after-days=30
scada.data.aggregation.methods=AVG,MIN,MAX,COUNT
```

### Query Historical Data

```bash
# Get data for last 24 hours
curl "http://localhost:8080/electricity/api/scada/data/sensor-01/history?hours=24"

# Get data for specific date range
curl "http://localhost:8080/electricity/api/scada/data/sensor-01/history?startDate=2026-07-01&endDate=2026-07-31"

# Export data as CSV
curl "http://localhost:8080/electricity/api/scada/data/export?format=csv&startDate=2026-07-01" > data.csv
```

## User Management

### Create Users

```bash
# Create new operator user
curl -X POST http://localhost:8080/electricity/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator01",
    "email": "operator01@company.com",
    "role": "OPERATOR",
    "sites": ["site-001", "site-002"]
  }'

# Create administrator user
curl -X POST http://localhost:8080/electricity/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "role": "ADMIN",
    "sites": []
  }'
```

### User Roles

| Role | Permissions |
|------|------------|
| ADMIN | Full system access, user management, configuration |
| SUPERVISOR | View all data, acknowledge alarms, reports |
| OPERATOR | View assigned sites, basic controls |
| VIEWER | Read-only access to dashboards |

## Security Configuration

### Enable HTTPS

```properties
server.ssl.enabled=true
server.ssl.key-store=/path/to/keystore.jks
server.ssl.key-store-password=keystorepass
server.ssl.key-store-type=JKS
server.ssl.key-alias=tomcat
```

### Configure Authentication

```properties
# JWT Configuration
security.jwt.secret=${JWT_SECRET}
security.jwt.expiration=86400000
security.jwt.refresh-expiration=604800000

# OAuth2 (optional)
security.oauth2.enabled=true
security.oauth2.client-id=${OAUTH_CLIENT_ID}
security.oauth2.client-secret=${OAUTH_CLIENT_SECRET}
```

### API Authentication

```bash
# Get authentication token
TOKEN=$(curl -X POST http://localhost:8080/electricity/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator01",
    "password": "password"
  }' | jq -r '.token')

# Use token in requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/electricity/api/scada/status
```

## Monitoring & Health Checks

### System Health Endpoint

```bash
# Check system health
curl http://localhost:8080/electricity/actuator/health

# Detailed health information
curl http://localhost:8080/electricity/actuator/health/details
```

### Metrics Collection

```bash
# View Prometheus metrics
curl http://localhost:8080/electricity/actuator/prometheus

# Specific metric query
curl 'http://localhost:8080/electricity/actuator/metrics/jvm.memory.used'
```

### Logging Configuration

```properties
# Application logging
logging.level.root=INFO
logging.level.com.electricity=DEBUG
logging.level.org.springframework=WARN

# File logging
logging.file.name=logs/electricity.log
logging.file.max-size=10MB
logging.file.max-history=30
logging.file.total-size-cap=1GB

# JSON logging for log aggregation
logging.pattern.json.enabled=true
```

## Maintenance

### Database Backups

```bash
# PostgreSQL backup
pg_dump -h localhost -U electricity_user electricity_db > backup.sql

# Restore backup
psql -h localhost -U electricity_user electricity_db < backup.sql
```

### System Updates

```bash
# Build new version
mvn clean package -DskipTests

# Backup current installation
cp -r /opt/electricity /opt/electricity.backup

# Deploy new version
cp target/electricity-1.0.0.jar /opt/electricity/

# Restart service
systemctl restart electricity
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
tail -f logs/electricity.log

# Verify database connection
psql -h localhost -U electricity_user -d electricity_db

# Check port availability
netstat -tulpn | grep 8080
```

### High Memory Usage

```properties
# Adjust JVM settings
-Xms1024m -Xmx2048m
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
```

### Slow Performance

1. Check database query performance
2. Review active connections
3. Analyze PLC communication delays
4. Check network bandwidth usage

## Next Steps

1. Set up PLC devices - See [PLC_INTEGRATION.md](./PLC_INTEGRATION.md)
2. Configure alarms and alerts
3. Create user accounts for operators
4. Set up backups and maintenance schedules
5. Deploy monitoring and metrics collection

---

For API documentation, see [API.md](./API.md)
