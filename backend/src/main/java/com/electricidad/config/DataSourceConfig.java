package com.electricidad.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Builds a "hot-swappable" DataSource proxy whose inner HikariDataSource
 * can be replaced at runtime by OracleConfigService without any restart.
 *
 * Startup is non-blocking: even if Oracle is unreachable the pool starts with
 * initializationFailTimeout=0 and Spring keeps running in demo-mode.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);
    private static final String CONFIG_FILE = "oracle_config.properties";

    @Value("${spring.datasource.url:jdbc:oracle:thin:@192.168.1.135:1521/ORCLPDB1}")
    private String defaultJdbcUrl;

    @Value("${spring.datasource.username:APP_ELECTRICIDAD}")
    private String username;

    @Value("${spring.datasource.password:Oracle123}")
    private String password;

    @Value("${spring.datasource.driver-class-name:oracle.jdbc.OracleDriver}")
    private String driverClassName;

    /**
     * Shared reference so OracleConfigService can hot-swap the inner pool.
     * Exposed as a static field so it can be injected without creating a cycle.
     */
    public static final AtomicReference<HikariDataSource> POOL_REF = new AtomicReference<>();

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = resolveStartupUrl();
        log.info("Inicializando pool de Oracle con JDBC URL: {}", url);

        HikariDataSource initial = buildPool(url, username, password, driverClassName);
        POOL_REF.set(initial);

        // Return a thin proxy so Spring/JPA always dereferences POOL_REF.get()
        return new DelegatingDataSource(POOL_REF);
    }

    // ──────────────────────────────────────────────────────────────────────────

    /** Try persisted config first; fallback to environment/properties default. */
    private String resolveStartupUrl() {
        try (InputStream in = Files.newInputStream(Paths.get(CONFIG_FILE))) {
            Properties props = new Properties();
            props.load(in);
            String ip  = props.getProperty("oracle.host.ip");
            String prt = props.getProperty("oracle.port",         "1521");
            String svc = props.getProperty("oracle.service.name", "ORCLPDB1");
            if (ip != null && !ip.isBlank()) {
                String url = "jdbc:oracle:thin:@" + ip.trim() + ":" + prt.trim() + "/" + svc.trim();
                log.info("Configuración Oracle cargada desde {}: {}", CONFIG_FILE, url);
                return url;
            }
        } catch (Exception e) {
            log.debug("No se encontró {} o error al leerlo (normal en primera ejecución): {}",
                    CONFIG_FILE, e.getMessage());
        }
        return defaultJdbcUrl;
    }

    public static HikariDataSource buildPool(String url, String user, String pass, String driver) {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(url);
        cfg.setUsername(user);
        cfg.setPassword(pass);
        cfg.setDriverClassName(driver);
        cfg.setMaximumPoolSize(20);
        cfg.setMinimumIdle(2);
        cfg.setIdleTimeout(300_000);
        cfg.setConnectionTimeout(5_000);
        cfg.setInitializationFailTimeout(0);   // non-blocking startup
        return new HikariDataSource(cfg);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Thin proxy – delegates every call to the current pool in POOL_REF
    // ──────────────────────────────────────────────────────────────────────────

    public static class DelegatingDataSource extends AbstractDataSource {
        private final AtomicReference<HikariDataSource> ref;

        public DelegatingDataSource(AtomicReference<HikariDataSource> ref) {
            this.ref = ref;
        }

        @Override
        public Connection getConnection() throws SQLException {
            return ref.get().getConnection();
        }

        @Override
        public Connection getConnection(String username, String password) throws SQLException {
            return ref.get().getConnection(username, password);
        }
    }
}
