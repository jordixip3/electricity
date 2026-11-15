package com.electricidad.service;

import com.electricidad.model.BateriaStatus;
import com.electricidad.repository.BateriaStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BatteryMonitoringService {

    private final BateriaStatusRepository bateriaStatusRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final Random random = new Random();

    // In-memory state tracking per battery (bateriaId -> state start timestamp)
    private final Map<Long, Instant> stateStartTimeMap = new ConcurrentHashMap<>();
    private final Map<Long, String> currentFlowStateMap = new ConcurrentHashMap<>();
    private final Map<Long, Double> currentSocMap = new ConcurrentHashMap<>();
    private final Map<Long, Boolean> permiteCargarMap = new ConcurrentHashMap<>();
    private final Map<Long, Boolean> permiteSuministrarMap = new ConcurrentHashMap<>();

    @Autowired
    public BatteryMonitoringService(BateriaStatusRepository bateriaStatusRepository,
                                    @Autowired(required = false) SimpMessagingTemplate messagingTemplate,
                                    @Autowired(required = false) org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.bateriaStatusRepository = bateriaStatusRepository;
        this.messagingTemplate = messagingTemplate;
        this.jdbcTemplate = jdbcTemplate;

        // Initialize state defaults for BESS units 1, 2, 3
        Instant now = Instant.now().minusSeconds(3600 * 2 + 840); // 2h 14m ago
        for (long bId = 1; bId <= 3; bId++) {
            stateStartTimeMap.put(bId, now);
            currentFlowStateMap.put(bId, bId == 1 ? "SUMINISTRANDO" : bId == 2 ? "CARGANDO" : "STANDBY");
            currentSocMap.put(bId, bId == 1 ? 82.5 : bId == 2 ? 45.0 : 91.0);
            permiteCargarMap.put(bId, true);
            permiteSuministrarMap.put(bId, true);
        }
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void seedHistoricalDataIfNeeded() {
        if (jdbcTemplate != null) {
            try {
                // Drop outdated pre-existing table if it lacks required columns
                jdbcTemplate.execute("DROP TABLE BATERIA_STATUS CASCADE CONSTRAINTS");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("CREATE TABLE BATERIA_STATUS (" +
                        "ID NUMBER PRIMARY KEY, " +
                        "BATERIA_ID NUMBER, " +
                        "FLOW_STATE VARCHAR2(30), " +
                        "VOLTAGE NUMBER(10,2), " +
                        "CORRIENTE NUMBER(10,2), " +
                        "FRECUENCIA NUMBER(10,2), " +
                        "POTENCIA NUMBER(10,2), " +
                        "SOC NUMBER(10,2), " +
                        "TEMPERATURE NUMBER(10,2), " +
                        "DURATION_SECONDS NUMBER(10), " +
                        "ES_HORA_VALLE NUMBER(1), " +
                        "PERMITE_CARGAR NUMBER(1), " +
                        "PERMITE_SUMINISTRAR NUMBER(1), " +
                        "PUNTO_CONEXION_NOMBRE VARCHAR2(100), " +
                        "TIMESTAMP TIMESTAMP)");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("CREATE SEQUENCE SEQ_BATERIA_STATUS START WITH 1 INCREMENT BY 1 NOCACHE");
            } catch (Exception ignored) {}
        }

        try {
            long count = bateriaStatusRepository.count();
            if (count < 100) {
                System.out.println(">>> Initializing 60 days of enhanced BESS telemetry in DB...");
                Instant now = Instant.now();
                long totalGenerated = 0;

                for (long bateriaId = 1; bateriaId <= 3; bateriaId++) {
                    double baseTempOffset = (bateriaId - 1) * 1.5;
                    String ptName = (bateriaId == 1) ? "Subestación Alpha 220kV - Bi-direccional" :
                                    (bateriaId == 2) ? "Parque Solar Beta - Punto de Inyección" :
                                    "Planta Industrial Gamma 66kV - Conexión Flexible";

                    for (int d = 60; d >= 0; d--) {
                        for (int h = 0; h < 24; h += 2) {
                            Instant timestamp = now.minus(d, java.time.temporal.ChronoUnit.DAYS)
                                                   .minus(24 - h, java.time.temporal.ChronoUnit.HOURS);

                            boolean esValle = (h >= 0 && h < 8) || (h >= 23);
                            String flow;
                            double voltage;
                            double current;
                            double frequency;
                            double power;
                            double soc;
                            double temp;
                            long durationSec = (h % 6 + 1) * 1800L;

                            if (esValle) {
                                // Horas valle: Bateria CARGANDO (absorbiendo de la red)
                                flow = "CARGANDO";
                                voltage = 415.0 + (random.nextDouble() * 4.0 - 2.0); // 413V - 417V AC
                                current = 120.0 + (random.nextDouble() * 30.0);       // 120A - 150A (Amperaje de carga)
                                frequency = 50.0 + (random.nextDouble() * 0.08 - 0.04); // ~50.0 Hz
                                power = Math.round((voltage * current * 1.732 / 1000.0) * 10.0) / 10.0; // kW
                                soc = 40.0 + (h * 5.0) + (random.nextDouble() * 2.0);
                                temp = 25.0 + baseTempOffset + (random.nextDouble() * 1.5);
                            } else if (h >= 18 && h <= 22) {
                                // Horas pico: Bateria SUMINISTRANDO (inyectando a la red)
                                flow = "SUMINISTRANDO";
                                voltage = 398.0 + (random.nextDouble() * 5.0 - 2.5); // 395V - 401V AC
                                current = 180.0 + (random.nextDouble() * 40.0);       // 180A - 220A (Amperaje de descarga)
                                frequency = 49.96 + (random.nextDouble() * 0.08 - 0.04); // ~49.96 Hz
                                power = Math.round((voltage * current * 1.732 / 1000.0) * 10.0) / 10.0; // kW
                                soc = 95.0 - ((h - 18) * 12.0) - (random.nextDouble() * 2.0);
                                temp = 29.0 + baseTempOffset + (random.nextDouble() * 2.0);
                            } else {
                                // Horas llanas / Standby
                                flow = "STANDBY";
                                voltage = 400.0 + (random.nextDouble() * 2.0 - 1.0);
                                current = 0.5 + (random.nextDouble() * 2.0);
                                frequency = 50.0 + (random.nextDouble() * 0.04 - 0.02);
                                power = 0.5;
                                soc = 75.0 + (random.nextDouble() * 5.0 - 2.5);
                                temp = 22.0 + baseTempOffset + (random.nextDouble() * 1.0);
                            }

                            voltage = Math.round(voltage * 10.0) / 10.0;
                            current = Math.round(current * 10.0) / 10.0;
                            frequency = Math.round(frequency * 100.0) / 100.0;
                            soc = Math.round(Math.max(10.0, Math.min(100.0, soc)) * 10.0) / 10.0;
                            temp = Math.round(temp * 10.0) / 10.0;

                            BateriaStatus status = new BateriaStatus(
                                null, bateriaId, flow, voltage, current, frequency, power, soc, temp,
                                durationSec, esValle, true, true, ptName, timestamp
                            );

                            bateriaStatusRepository.save(status);
                            totalGenerated++;
                        }
                    }
                }
                System.out.println(">>> Successfully seeded " + totalGenerated + " BESS telemetry records in DB.");
            }
        } catch (Exception e) {
            System.err.println(">>> Warning seeding BESS history: " + e.getMessage());
        }
    }

    // Scheduled telemetry loop every 15 seconds (batched to minimize DB network roundtrips)
    @Scheduled(fixedRate = 15000)
    public void broadcastLatestBatteryStatus() {
        LocalTime nowTime = LocalTime.now();
        // Horas valle: 00:00 a 08:00 o 23:00 a 23:59
        boolean esHoraValle = (nowTime.getHour() < 8 || nowTime.getHour() >= 23);

        List<BateriaStatus> latestList = new ArrayList<>();

        for (long bId = 1; bId <= 3; bId++) {
            boolean pCargar = permiteCargarMap.getOrDefault(bId, true);
            boolean pSuministrar = permiteSuministrarMap.getOrDefault(bId, true);

            // Determine operating mode dynamically according to Horas Valle & PuntoConexion permissions
            String flowMode = currentFlowStateMap.get(bId);

            if (!"MANUAL".equals(flowMode)) {
                if (esHoraValle && pCargar) {
                    flowMode = "CARGANDO";
                } else if (!esHoraValle && pSuministrar) {
                    flowMode = "SUMINISTRANDO";
                } else {
                    flowMode = "STANDBY";
                }
                currentFlowStateMap.put(bId, flowMode);
            }

            Instant stateStart = stateStartTimeMap.computeIfAbsent(bId, id -> Instant.now().minusSeconds(1200));
            long durationSec = Math.max(0, Instant.now().getEpochSecond() - stateStart.getEpochSecond());

            double voltage;
            double current;
            double frequency;
            double power;
            double currentSoc = currentSocMap.getOrDefault(bId, 75.0);
            double temp;

            if ("CARGANDO".equals(flowMode)) {
                // Absorbiendo energía de la red en Horas Valle
                voltage = Math.round((412.0 + random.nextDouble() * 6.0) * 10.0) / 10.0; // 412V - 418V AC
                current = Math.round((115.0 + random.nextDouble() * 25.0) * 10.0) / 10.0; // 115A - 140A
                frequency = Math.round((50.0 + random.nextDouble() * 0.06 - 0.03) * 100.0) / 100.0; // 50.0 Hz
                power = Math.round((voltage * current * 1.732 / 1000.0) * 10.0) / 10.0; // kW
                currentSoc = Math.min(100.0, currentSoc + 0.15); // Carga progresiva
                temp = Math.round((24.0 + random.nextDouble() * 3.0) * 10.0) / 10.0;
            } else if ("SUMINISTRANDO".equals(flowMode)) {
                // Suministrando energía a la red/carga
                voltage = Math.round((396.0 + random.nextDouble() * 8.0) * 10.0) / 10.0; // 396V - 404V AC
                current = Math.round((170.0 + random.nextDouble() * 35.0) * 10.0) / 10.0; // 170A - 205A
                frequency = Math.round((49.97 + random.nextDouble() * 0.06 - 0.03) * 100.0) / 100.0; // 49.97 Hz
                power = Math.round((voltage * current * 1.732 / 1000.0) * 10.0) / 10.0; // kW
                currentSoc = Math.max(10.0, currentSoc - 0.20); // Descarga progresiva
                temp = Math.round((28.5 + random.nextDouble() * 3.5) * 10.0) / 10.0;
            } else {
                // Standby
                voltage = Math.round((400.0 + random.nextDouble() * 2.0) * 10.0) / 10.0;
                current = Math.round((0.4 + random.nextDouble() * 1.5) * 10.0) / 10.0;
                frequency = Math.round((50.0 + random.nextDouble() * 0.02 - 0.01) * 100.0) / 100.0;
                power = 0.2;
                temp = Math.round((22.0 + random.nextDouble() * 2.0) * 10.0) / 10.0;
            }

            currentSocMap.put(bId, currentSoc);

            String ptName = (bId == 1) ? "Subestación Alpha 220kV - Bi-direccional" :
                            (bId == 2) ? "Parque Solar Beta - Punto de Inyección" :
                            "Planta Industrial Gamma 66kV - Conexión Flexible";

            BateriaStatus status = new BateriaStatus(
                null, bId, flowMode, voltage, current, frequency, power,
                Math.round(currentSoc * 10.0) / 10.0, temp, durationSec,
                esHoraValle, pCargar, pSuministrar, ptName, Instant.now()
            );

            latestList.add(status);
        }

        try {
            bateriaStatusRepository.saveAll(latestList);
        } catch (Exception e) {
            // Non-blocking catch to keep API fast
        }

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/battery", latestList);
        }
    }

    // Set dynamic operating mode for a battery
    public BateriaStatus setBateriaModoOperacion(Long bateriaId, String modo) {
        currentFlowStateMap.put(bateriaId, modo);
        stateStartTimeMap.put(bateriaId, Instant.now());
        List<BateriaStatus> latest = bateriaStatusRepository.findTop5ByOrderByTimestampDesc();
        return latest.isEmpty() ? new BateriaStatus() : latest.get(0);
    }

    // Update PuntoConexion permissions for a battery
    public void updatePuntoConexionPermisos(Long bateriaId, boolean permiteCargar, boolean permiteSuministrar) {
        permiteCargarMap.put(bateriaId, permiteCargar);
        permiteSuministrarMap.put(bateriaId, permiteSuministrar);
    }

    // Return top 5 latest battery status records
    public List<BateriaStatus> getLatestBatteryStatus() {
        List<BateriaStatus> latest = bateriaStatusRepository.findTop5ByOrderByTimestampDesc();
        if (latest.isEmpty()) {
            BateriaStatus init = new BateriaStatus(
                1L, 1L, "SUMINISTRANDO", 400.0, 185.0, 50.0, 74.0, 82.5, 26.5,
                7800L, false, true, true, "Subestación Alpha 220kV - Bi-direccional", Instant.now()
            );
            latest = List.of(init);
        }
        return latest;
    }

    // Return historical status records for specified days
    public List<BateriaStatus> getHistoricalBatteryStatus(int days, Long bateriaId) {
        Instant threshold = Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);
        if (bateriaId != null && bateriaId > 0) {
            return bateriaStatusRepository.findByBateriaIdAndTimestampAfterOrderByTimestampAsc(bateriaId, threshold);
        } else {
            return bateriaStatusRepository.findByTimestampAfterOrderByTimestampAsc(threshold);
        }
    }
}
