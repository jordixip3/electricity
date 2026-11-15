package com.electricidad.config;

import com.electricidad.model.*;
import com.electricidad.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ClienteRepository clienteRepository;
    private final PlcRepository plcRepository;
    private final MedidorRepository medidorRepository;
    private final LecturaRepository lecturaRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final BateriaStatusRepository bateriaStatusRepository;

    public DataInitializer(ClienteRepository clienteRepository,
                           PlcRepository plcRepository,
                           MedidorRepository medidorRepository,
                           LecturaRepository lecturaRepository,
                           IncidenciaRepository incidenciaRepository,
                           BateriaStatusRepository bateriaStatusRepository) {
        this.clienteRepository = clienteRepository;
        this.plcRepository = plcRepository;
        this.medidorRepository = medidorRepository;
        this.lecturaRepository = lecturaRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.bateriaStatusRepository = bateriaStatusRepository;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Verificando y expandiendo datos demo de la red eléctrica en la Base de Datos...");

        // 1. Ensure at least 10 Clientes
        List<Cliente> clientes = clienteRepository.findAll();
        if (clientes.size() < 10) {
            String[][] demoClientes = {
                {"Industrias Solares S.L.", "info@industriassolares.com"},
                {"Comercial Energía Verde", "contacto@energiaverde.es"},
                {"Residencial Parque Norte", "admin@parquenorte.es"},
                {"Parque Solar Alfa 50MW", "operaciones@solaralfa.es"},
                {"Datacenter Iberia Cloud", "ops@datacenteriberia.com"},
                {"Hospital Universitario Central", "infraestructura@hosp-central.es"},
                {"Planta Química QuimiNor", "mantenimiento@quiminor.es"},
                {"Red Electrolineras EV-Hub", "red@evhubcharge.es"},
                {"Polígono Industrial El Viso", "gestion@elvisoindustrial.es"},
                {"Centro Comercial Plaza Real", "tecnico@plazareal.com"}
            };
            for (String[] dc : demoClientes) {
                if (clientes.stream().noneMatch(c -> c.getEmail().equalsIgnoreCase(dc[1]))) {
                    Cliente c = new Cliente();
                    c.setNombre(dc[0]);
                    c.setEmail(dc[1]);
                    c.setFechaAlta(LocalDate.now().minusDays(new Random().nextInt(365)));
                    clientes.add(clienteRepository.save(c));
                    log.info("Cliente creado: {}", dc[0]);
                }
            }
        }

        // 2. Ensure at least 8 PLCs
        List<Plc> plcs = plcRepository.findAll();
        if (plcs.size() < 8) {
            Object[][] demoPlcs = {
                {"PLC-SUBESTACION-NORTE", "192.168.10.10", "ONLINE", "Subestación Alta Tensión 400kV"},
                {"PLC-SUBESTACION-SUR", "192.168.10.11", "ONLINE", "Subestación Transformadora Sur 220kV"},
                {"PLC-BESS-RACK-01", "192.168.10.15", "ONLINE", "Banco BESS Baterías Ion-Litio Subestación"},
                {"PLC-BESS-RACK-02", "192.168.10.16", "ONLINE", "Banco BESS Auxiliar Baterías"},
                {"PLC-PARQUE-SOLAR", "192.168.10.20", "ONLINE", "Parque Fotovoltaico Alfa 50MW"},
                {"PLC-DATA-CENTER", "192.168.10.25", "ONLINE", "Anillo Red Crítica Datacenter"},
                {"PLC-HOSPITAL-CRITICO", "192.168.10.30", "ONLINE", "Centro de Control Hospital Central"},
                {"PLC-ZONA-INDUSTRIAL", "192.168.10.40", "INACTIVO", "Polígono Industrial El Viso Nave B"}
            };
            for (Object[] dp : demoPlcs) {
                String name = (String) dp[0];
                if (plcs.stream().noneMatch(p -> p.getNombre().equalsIgnoreCase(name))) {
                    Plc p = new Plc();
                    p.setNombre(name);
                    p.setIp((String) dp[1]);
                    p.setEstado((String) dp[2]);
                    p.setUbicacion((String) dp[3]);
                    p.setUltimaConexion(LocalDateTime.now().minusMinutes(new Random().nextInt(60)));
                    plcs.add(plcRepository.save(p));
                    log.info("PLC creado: {}", name);
                }
            }
        }

        // 3. Ensure at least 22 Medidores (Contadores)
        List<Medidor> medidores = medidorRepository.findAll();
        if (medidores.size() < 22) {
            Random r = new Random();
            int currentCount = medidores.size();
            for (int i = currentCount + 1; i <= 24; i++) {
                String serial = String.format("MED-2024-%03d", i);
                if (medidores.stream().noneMatch(m -> m.getNumeroSerie().equalsIgnoreCase(serial))) {
                    Cliente cli = clientes.get(r.nextInt(clientes.size()));
                    Plc plc = plcs.get(r.nextInt(plcs.size()));

                    Medidor m = new Medidor();
                    m.setNumeroSerie(serial);
                    m.setCliente(cli);
                    m.setPlc(plc);
                    m.setActivo(true);
                    m.setEstadoConexion(r.nextDouble() > 0.15 ? "CONECTADO" : "DESCONECTADO");
                    
                    double volt = 225.0 + r.nextDouble() * 15.0; // 225-240V
                    double curr = 5.0 + r.nextDouble() * 25.0;  // 5-30A
                    double power = (volt * curr * 1.732) / 1000.0;
                    double freq = 49.95 + r.nextDouble() * 0.1;
                    double temp = 22.0 + r.nextDouble() * 18.0;

                    m.setVoltaje(Math.round(volt * 100.0) / 100.0);
                    m.setCorriente(Math.round(curr * 100.0) / 100.0);
                    m.setPotencia(Math.round(power * 100.0) / 100.0);
                    m.setFrecuencia(Math.round(freq * 100.0) / 100.0);
                    m.setTemperatura(Math.round(temp * 10.0) / 10.0);

                    medidores.add(medidorRepository.save(m));
                    log.info("Medidor creado: {} asociado a PLC {}", serial, plc.getNombre());
                }
            }
        }

        // 4. Seed BESS Battery Status Telemetry if needed
        long bCount = bateriaStatusRepository.count();
        if (bCount < 5) {
            Random r = new Random();
            for (int i = 1; i <= 4; i++) {
                BateriaStatus bs = new BateriaStatus();
                bs.setBateriaId((long) i);
                bs.setFlowState(i % 2 == 0 ? "CARGANDO" : "SUMINISTRANDO");
                bs.setVoltage(48.0 + r.nextDouble() * 8.0);
                bs.setCurrent(15.0 + r.nextDouble() * 20.0);
                bs.setFrequency(50.0);
                bs.setPower((bs.getVoltage() * bs.getCurrent()) / 1000.0);
                bs.setSoc(65.0 + r.nextDouble() * 30.0);
                bs.setTemperature(24.0 + r.nextDouble() * 10.0);
                bs.setDurationSeconds(1200L + r.nextInt(7200));
                bs.setEsHoraValle(true);
                bs.setPermiteCargar(true);
                bs.setPermiteSuministrar(true);
                bs.setPuntoConexionNombre(i == 1 ? "Subestación Principal Bi-direccional" : "Punto de Inyección Red Sur");
                bs.setTimestamp(Instant.now());
                bateriaStatusRepository.save(bs);
            }
            log.info("Telemetría de baterías BESS generada.");
        }

        log.info("✅ Inicialización y expansión de base de datos completada con éxito. Total Clientes: {}, PLCs: {}, Medidores: {}",
                clientes.size(), plcs.size(), medidores.size());
        } catch (Exception e) {
            log.warn("⚠️ Oracle DB no disponible inmediatamente durante el arranque para poblar datos: {}. La aplicación seguirá activa y OracleConfigService se reconectará automáticamente.", e.getMessage());
        }
    }
}
