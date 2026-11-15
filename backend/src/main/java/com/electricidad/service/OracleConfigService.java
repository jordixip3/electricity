package com.electricidad.service;

import com.electricidad.config.DataSourceConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Manages Oracle DB connectivity dynamically.
 *
 * Key features:
 *  - Reads/writes oracle_config.properties (mounted volume) so config survives
 *    container restarts across any network.
 *  - Hot-swaps the Hikari pool via DataSourceConfig.POOL_REF whenever the IP
 *    changes or connection is recovered.
 *  - Scheduled auto-reconnect every 30 s: if Oracle was unreachable and comes
 *    back (e.g. Mac moves to a new Wi-Fi, VirtualBox starts, etc.) the pool is
 *    rebuilt automatically without any user action.
 */
@Service
public class OracleConfigService {

    private static final Logger log = LoggerFactory.getLogger(OracleConfigService.class);
    private static final String CONFIG_FILE_NAME = "oracle_config.properties";
    private static final int SOCKET_TIMEOUT_MS   = 3000;

    @Value("${spring.datasource.username:APP_ELECTRICIDAD}")
    private String dbUsername;

    @Value("${spring.datasource.password:Oracle123}")
    private String dbPassword;

    private volatile String currentOracleIp    = "192.168.1.135";
    private volatile int    currentPort        = 1521;
    private volatile String currentServiceName = "ORCLPDB1";

    private final AtomicBoolean wasConnected = new AtomicBoolean(false);

    // Called once at startup by Spring (post-construct) to sync fields with
    // whatever pool DataSourceConfig already created.
    @jakarta.annotation.PostConstruct
    private void init() {
        // Read the current JDBC URL from the pool (already resolved by DataSourceConfig)
        HikariDataSource pool = DataSourceConfig.POOL_REF.get();
        if (pool != null) {
            parseAndSetFromJdbcUrl(pool.getJdbcUrl());
        }
        // Also check live config file (in case it was updated after pool creation)
        loadSavedConfig();
        log.info("OracleConfigService inicializado → {}:{}/{}", currentOracleIp, currentPort, currentServiceName);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Auto-reconnect scheduler – runs every 30 seconds
    // ─────────────────────────────────────────────────────────────────────────

    @Scheduled(fixedDelay = 30_000, initialDelay = 20_000)
    public void autoReconnect() {
        boolean reachable = testSocketConnection(currentOracleIp, currentPort, SOCKET_TIMEOUT_MS);

        if (reachable && !wasConnected.get()) {
            log.info("✅ Oracle DB en {}:{} volvió a ser accesible. Reconstruyendo pool Hikari automáticamente…",
                    currentOracleIp, currentPort);
            rebuildPool(currentOracleIp, currentPort, currentServiceName);
            wasConnected.set(true);
        } else if (!reachable && wasConnected.get()) {
            log.warn("⚠️ Oracle DB en {}:{} dejó de responder. Reintentando en 30 s…",
                    currentOracleIp, currentPort);
            wasConnected.set(false);
        } else if (!reachable) {
            log.debug("Oracle DB en {}:{} aún no disponible, reintentando…", currentOracleIp, currentPort);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> getConfigStatus() {
        boolean reachable = testSocketConnection(currentOracleIp, currentPort, SOCKET_TIMEOUT_MS);
        wasConnected.set(reachable);

        Map<String, Object> status = new HashMap<>();
        status.put("oracleIp",    currentOracleIp);
        status.put("port",        currentPort);
        status.put("serviceName", currentServiceName);
        status.put("connected",   reachable);
        status.put("jdbcUrl",     buildJdbcUrl(currentOracleIp, currentPort, currentServiceName));
        status.put("message", reachable
                ? "Conexión a Oracle DB (" + currentOracleIp + ":" + currentPort + ") activa."
                : "Oracle DB en " + currentOracleIp + ":" + currentPort
                  + " no disponible. Reconexión automática cada 30 s.");
        return status;
    }

    /**
     * Saves new Oracle IP (and optionally port/service), then immediately
     * tries to connect.  If reachable → pool rebuilt right away.
     * If not reachable → config saved anyway; scheduler will rebuild when it comes up.
     */
    public synchronized Map<String, Object> updateAndTestConfig(String newIp,
                                                                  Integer port,
                                                                  String serviceName) {
        Map<String, Object> res = new HashMap<>();

        if (newIp == null || newIp.trim().isEmpty()) {
            res.put("success", false);
            res.put("message", "La IP especificada no es válida.");
            return res;
        }

        String targetIp      = newIp.trim();
        int    targetPort    = (port != null && port > 0) ? port : 1521;
        String targetService = (serviceName != null && !serviceName.trim().isEmpty())
                ? serviceName.trim() : "ORCLPDB1";

        // Always persist first so any restart picks it up even if Oracle is down now
        saveConfig(targetIp, targetPort, targetService);
        this.currentOracleIp    = targetIp;
        this.currentPort        = targetPort;
        this.currentServiceName = targetService;

        log.info("Nueva IP Oracle guardada: {}:{}/{}", targetIp, targetPort, targetService);

        boolean reachable = testSocketConnection(targetIp, targetPort, SOCKET_TIMEOUT_MS);

        if (reachable) {
            rebuildPool(targetIp, targetPort, targetService);
            wasConnected.set(true);
            res.put("success",   true);
            res.put("connected", true);
            res.put("message",   "🟢 Conexión a Oracle DB (" + targetIp + ":" + targetPort
                                + "/" + targetService + ") verificada y activa.");
        } else {
            wasConnected.set(false);
            res.put("success",   true);   // saved OK
            res.put("connected", false);
            res.put("message",   "💾 IP guardada (" + targetIp + ":" + targetPort
                                + "). Oracle no responde aún; el sistema reconectará automáticamente cuando esté disponible.");
        }

        res.put("oracleIp",    targetIp);
        res.put("port",        targetPort);
        res.put("serviceName", targetService);
        res.put("jdbcUrl",     buildJdbcUrl(targetIp, targetPort, targetService));
        return res;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Pool management
    // ─────────────────────────────────────────────────────────────────────────

    private void rebuildPool(String ip, int port, String service) {
        HikariDataSource old = DataSourceConfig.POOL_REF.get();
        try {
            HikariDataSource fresh = DataSourceConfig.buildPool(
                    buildJdbcUrl(ip, port, service), dbUsername, dbPassword,
                    "oracle.jdbc.OracleDriver");
            DataSourceConfig.POOL_REF.set(fresh);
            log.info("Pool Hikari reconstruido → {}", buildJdbcUrl(ip, port, service));
        } catch (Exception e) {
            log.error("Error al reconstruir pool Hikari: {}", e.getMessage());
            DataSourceConfig.POOL_REF.set(old); // rollback
        } finally {
            if (old != null) {
                try { old.close(); } catch (Exception ignored) {}
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    public boolean testSocketConnection(String ip, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ip, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static String buildJdbcUrl(String ip, int port, String service) {
        return "jdbc:oracle:thin:@" + ip + ":" + port + "/" + service;
    }

    private void loadSavedConfig() {
        try (InputStream in = Files.newInputStream(Paths.get(CONFIG_FILE_NAME))) {
            Properties props = new Properties();
            props.load(in);
            String ip  = props.getProperty("oracle.host.ip");
            String prt = props.getProperty("oracle.port",         "1521");
            String svc = props.getProperty("oracle.service.name", "ORCLPDB1");
            if (ip != null && !ip.trim().isEmpty()) {
                this.currentOracleIp    = ip.trim();
                this.currentServiceName = svc.trim();
                try { this.currentPort = Integer.parseInt(prt.trim()); }
                catch (NumberFormatException ignored) {}
            }
        } catch (Exception e) {
            log.debug("Sin archivo {}: {}", CONFIG_FILE_NAME, e.getMessage());
        }
    }

    private void parseAndSetFromJdbcUrl(String jdbcUrl) {
        try {
            String stripped = jdbcUrl.replace("jdbc:oracle:thin:@", "");
            String[] parts  = stripped.split("[:/]");
            if (parts.length >= 3) {
                this.currentOracleIp    = parts[0];
                this.currentPort        = Integer.parseInt(parts[1]);
                this.currentServiceName = parts[2];
            }
        } catch (Exception e) {
            log.warn("No se pudo parsear JDBC URL: {}", jdbcUrl);
        }
    }

    private void saveConfig(String ip, int port, String serviceName) {
        Properties props = new Properties();
        props.setProperty("oracle.host.ip",      ip);
        props.setProperty("oracle.port",         String.valueOf(port));
        props.setProperty("oracle.service.name", serviceName);
        try (OutputStream out = Files.newOutputStream(Paths.get(CONFIG_FILE_NAME))) {
            props.store(out, "Oracle Database Dynamic Connection Settings");
        } catch (Exception e) {
            log.error("No se pudo guardar {}: {}", CONFIG_FILE_NAME, e.getMessage());
        }
    }
}
