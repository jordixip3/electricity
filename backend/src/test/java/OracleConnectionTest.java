import java.sql.*;

/**
 * Standalone Oracle JDBC connectivity validator for proyecto Electricidad.
 * Compila y ejecuta sin necesidad de Spring Boot.
 *
 * Uso:
 *   javac -cp ojdbc11.jar OracleConnectionTest.java
 *   java  -cp .:ojdbc11.jar OracleConnectionTest
 */
public class OracleConnectionTest {

    // ── Parámetros de conexión (se leen de env si están disponibles) ─────────
    static final String JDBC_URL = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_URL", "jdbc:oracle:thin:@192.168.1.130:1521/ORCLPDB1");
    static final String USERNAME = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_USERNAME", "APP_ELECTRICIDAD");
    static final String PASSWORD = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_PASSWORD", "Oracle123");

    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════════════════╗");
        System.out.println("║   ELECTRICIDAD — Oracle DB Connection Validator      ║");
        System.out.println("╚══════════════════════════════════════════════════════╝");
        System.out.println();
        System.out.println("► URL       : " + JDBC_URL);
        System.out.println("► Usuario   : " + USERNAME);
        System.out.println("► Password  : " + "*".repeat(PASSWORD.length()));
        System.out.println();

        long start = System.currentTimeMillis();

        try {
            // 1. Cargar driver
            System.out.println("[1] Cargando Oracle JDBC Driver (ojdbc11)...");
            Class.forName("oracle.jdbc.OracleDriver");
            System.out.println("    ✓ Driver cargado correctamente.");
            System.out.println();

            // 2. Establecer conexión
            System.out.println("[2] Estableciendo conexión con la base de datos...");
            try (Connection conn = DriverManager.getConnection(JDBC_URL, USERNAME, PASSWORD)) {
                long elapsed = System.currentTimeMillis() - start;
                System.out.println("    ✓ Conexión establecida en " + elapsed + " ms.");
                System.out.println();

                // 3. Metadatos de la BBDD
                System.out.println("[3] Metadatos de la Base de Datos:");
                DatabaseMetaData meta = conn.getMetaData();
                System.out.println("    ► Product Name    : " + meta.getDatabaseProductName());
                System.out.println("    ► Product Version : " + meta.getDatabaseProductVersion());
                System.out.println("    ► Driver Name     : " + meta.getDriverName());
                System.out.println("    ► Driver Version  : " + meta.getDriverVersion());
                System.out.println("    ► URL de conexión : " + meta.getURL());
                System.out.println("    ► Usuario activo  : " + meta.getUserName());
                System.out.println();

                // 4. Test query sobre tablas del proyecto
                System.out.println("[4] Verificando tablas del esquema APP_ELECTRICIDAD...");
                String[] tablasEsperadas = {
                    "CLIENTE", "PLC", "MEDIDOR", "LECTURA", "INCIDENCIA", 
                    "PUNTO_CONEXION", "BATERIA", "BATERIA_STATUS"
                };

                try (Statement st = conn.createStatement()) {
                    for (String tabla : tablasEsperadas) {
                        try {
                            ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM " + tabla);
                            if (rs.next()) {
                                int count = rs.getInt(1);
                                System.out.printf("    ✓ %-25s → %d registros%n", tabla, count);
                            }
                            rs.close();
                        } catch (SQLException e) {
                            System.out.printf("    ✗ %-25s → NO ENCONTRADA (%s)%n", tabla, e.getMessage());
                        }
                    }
                }
                System.out.println();

                // 5. Test de versión Oracle con DUAL
                System.out.println("[5] Query de verificación sobre DUAL:");
                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery("SELECT TO_CHAR(SYSDATE,'DD/MM/YYYY HH24:MI:SS') AS FECHA_ORACLE FROM DUAL")) {
                    if (rs.next()) {
                        System.out.println("    ✓ SYSDATE Oracle = " + rs.getString("FECHA_ORACLE"));
                    }
                }
                System.out.println();

                // 6. Test de permisos básicos
                System.out.println("[6] Verificando permisos del usuario:");
                try (Statement st = conn.createStatement();
                     ResultSet rs = st.executeQuery(
                         "SELECT PRIVILEGE FROM USER_SYS_PRIVS")) {
                    boolean found = false;
                    while (rs.next()) {
                        System.out.println("    ► " + rs.getString("PRIVILEGE"));
                        found = true;
                    }
                    if (!found) System.out.println("    (Sin privilegios de sistema asignados directamente — normal en entornos con roles)");
                } catch (SQLException e) {
                    System.out.println("    (No se pudieron leer USER_SYS_PRIVS: " + e.getMessage() + ")");
                }
                System.out.println();

                // Resumen final
                System.out.println("╔══════════════════════════════════════════════════════╗");
                System.out.println("║   ✅  RESULTADO: CONEXIÓN ORACLE VALIDADA CON ÉXITO  ║");
                System.out.println("╚══════════════════════════════════════════════════════╝");

            } // conn auto-closed aquí

        } catch (ClassNotFoundException e) {
            System.err.println();
            System.err.println("❌ ERROR: Driver ojdbc11 no encontrado en classpath.");
            System.err.println("   Asegúrese de incluir ojdbc11.jar al compilar/ejecutar.");
            System.exit(1);
        } catch (SQLException e) {
            long elapsed = System.currentTimeMillis() - start;
            System.err.println();
            System.err.println("❌ ERROR DE CONEXIÓN ORACLE (" + elapsed + " ms)");
            System.err.println("   SQL State  : " + e.getSQLState());
            System.err.println("   Error Code : " + e.getErrorCode());
            System.err.println("   Mensaje    : " + e.getMessage());
            System.err.println();

            // Diagnóstico automático por código de error Oracle
            int code = e.getErrorCode();
            if (code == 17002 || e.getMessage().contains("Connection refused") || e.getMessage().contains("IO Error")) {
                System.err.println("   🔍 DIAGNÓSTICO: El servidor Oracle no responde en " + JDBC_URL);
                System.err.println("      → Verifique que Oracle Database esté arrancado.");
                System.err.println("      → Compruebe que el Listener esté activo: lsnrctl status");
                System.err.println("      → Verifique conectividad de red: nc -zv 192.168.1.130 1521");
            } else if (code == 1017) {
                System.err.println("   🔍 DIAGNÓSTICO: Credenciales incorrectas (ORA-01017).");
                System.err.println("      → Usuario: " + USERNAME + " | Revise la contraseña.");
            } else if (code == 12514 || code == 12505) {
                System.err.println("   🔍 DIAGNÓSTICO: Service Name incorrecto (ORA-" + code + ").");
                System.err.println("      → Verifique el service name del PDB: SELECT NAME FROM V$PDBS;");
            } else if (code == 28000) {
                System.err.println("   🔍 DIAGNÓSTICO: Cuenta de usuario bloqueada (ORA-28000).");
                System.err.println("      → ALTER USER APP_ELECTRICIDAD ACCOUNT UNLOCK;");
            }
            System.exit(1);
        }
    }
}
