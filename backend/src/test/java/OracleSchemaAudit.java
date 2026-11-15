import java.sql.*;

/**
 * Auditor completo del esquema Oracle — proyecto Electricidad.
 * Lista TODAS las tablas y secuencias existentes en el schema APP_ELECTRICIDAD
 * y cuenta registros para detectar qué existe y qué falta.
 */
public class OracleSchemaAudit {

    static final String JDBC_URL = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_URL", "jdbc:oracle:thin:@172.20.10.9:1521/ORCLPDB1");
    static final String USERNAME = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_USERNAME", "APP_ELECTRICIDAD");
    static final String PASSWORD = System.getenv().getOrDefault(
        "SPRING_DATASOURCE_PASSWORD", "Oracle123");

    public static void main(String[] args) throws Exception {
        System.out.println("╔══════════════════════════════════════════════════════╗");
        System.out.println("║   ELECTRICIDAD — Oracle Schema Auditor               ║");
        System.out.println("╚══════════════════════════════════════════════════════╝");
        System.out.println("► Conectando a: " + JDBC_URL);
        System.out.println();

        Class.forName("oracle.jdbc.OracleDriver");

        try (Connection conn = DriverManager.getConnection(JDBC_URL, USERNAME, PASSWORD)) {
            System.out.println("✓ Conexión establecida.\n");

            // 1. Todas las tablas del usuario
            System.out.println("┌─────────────────────────────────────────────────────┐");
            System.out.println("│  TABLAS EN ESQUEMA APP_ELECTRICIDAD                 │");
            System.out.println("└─────────────────────────────────────────────────────┘");
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery(
                     "SELECT table_name FROM user_tables ORDER BY table_name")) {
                boolean found = false;
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    // Contar registros
                    try (Statement st2 = conn.createStatement();
                         ResultSet rs2 = st2.executeQuery("SELECT COUNT(*) FROM " + tableName)) {
                        int count = rs2.next() ? rs2.getInt(1) : -1;
                        System.out.printf("  %-35s → %d registros%n", tableName, count);
                    } catch (Exception e) {
                        System.out.printf("  %-35s → ERROR: %s%n", tableName, e.getMessage());
                    }
                    found = true;
                }
                if (!found) System.out.println("  (Sin tablas en el esquema)");
            }

            System.out.println();

            // 2. Todas las secuencias del usuario
            System.out.println("┌─────────────────────────────────────────────────────┐");
            System.out.println("│  SECUENCIAS EN ESQUEMA APP_ELECTRICIDAD             │");
            System.out.println("└─────────────────────────────────────────────────────┘");
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery(
                     "SELECT sequence_name, last_number FROM user_sequences ORDER BY sequence_name")) {
                boolean found = false;
                while (rs.next()) {
                    System.out.printf("  %-35s → último valor: %d%n",
                        rs.getString("SEQUENCE_NAME"), rs.getLong("LAST_NUMBER"));
                    found = true;
                }
                if (!found) System.out.println("  (Sin secuencias en el esquema)");
            }

            System.out.println();

            // 3. Vistas del usuario
            System.out.println("┌─────────────────────────────────────────────────────┐");
            System.out.println("│  VISTAS EN ESQUEMA APP_ELECTRICIDAD                 │");
            System.out.println("└─────────────────────────────────────────────────────┘");
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery(
                     "SELECT view_name FROM user_views ORDER BY view_name")) {
                boolean found = false;
                while (rs.next()) {
                    System.out.printf("  %s%n", rs.getString("VIEW_NAME"));
                    found = true;
                }
                if (!found) System.out.println("  (Sin vistas en el esquema)");
            }

            System.out.println();

            // 4. Flyway schema history si existe
            System.out.println("┌─────────────────────────────────────────────────────┐");
            System.out.println("│  HISTORIAL FLYWAY (flyway_schema_history)           │");
            System.out.println("└─────────────────────────────────────────────────────┘");
            try (Statement st = conn.createStatement();
                 ResultSet rs = st.executeQuery(
                     "SELECT version, description, type, success, installed_on " +
                     "FROM flyway_schema_history ORDER BY installed_rank")) {
                boolean found = false;
                while (rs.next()) {
                    System.out.printf("  V%-5s %-40s success=%-5s  %s%n",
                        rs.getString("VERSION"),
                        rs.getString("DESCRIPTION"),
                        rs.getString("SUCCESS"),
                        rs.getString("INSTALLED_ON"));
                    found = true;
                }
                if (!found) System.out.println("  (Flyway history vacía — migraciones no ejecutadas)");
            } catch (SQLException e) {
                System.out.println("  (Tabla flyway_schema_history no existe — Flyway nunca ejecutado)");
            }
        }
    }
}
