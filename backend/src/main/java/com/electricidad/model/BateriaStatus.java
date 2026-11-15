package com.electricidad.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Represents the status and telemetry readings of a BESS battery.
 * Tracks operating mode (CARGANDO / SUMINISTRANDO), amperage, voltage, frequency (Hz),
 * active state duration, off-peak schedule status, and connection point limits.
 */
@Entity
@Table(name = "BATERIA_STATUS")
public class BateriaStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bateria_status_seq")
    @SequenceGenerator(name = "bateria_status_seq", sequenceName = "SEQ_BATERIA_STATUS", allocationSize = 1)
    private Long id;

    @Column(name = "bateria_id")
    private Long bateriaId;

    @Column(name = "flow_state", length = 30)
    private String flowState = "STANDBY"; // CARGANDO, SUMINISTRANDO, STANDBY

    @Column(name = "voltage")
    private Double voltage; // V (Voltios)

    @Column(name = "corriente")
    private Double current; // A (Amperios)

    @Column(name = "frecuencia")
    private Double frequency = 50.0; // Hz (Frecuencia de la red/batería)

    @Column(name = "potencia")
    private Double power; // kW

    @Column(name = "soc")
    private Double soc = 75.0; // % State of Charge

    @Column(name = "temperature")
    private Double temperature; // °C

    @Column(name = "duration_seconds")
    private Long durationSeconds = 0L; // Tiempo transcurrido en el estado actual (segundos)

    @Transient
    private String formattedDuration; // e.g. "2h 14m 30s"

    @Column(name = "es_hora_valle")
    private Boolean esHoraValle = false;

    @Column(name = "permite_cargar")
    private Boolean permiteCargar = true;

    @Column(name = "permite_suministrar")
    private Boolean permiteSuministrar = true;

    @Column(name = "punto_conexion_nombre")
    private String puntoConexionNombre = "Subestación Principal Bi-direccional";

    @Column(name = "timestamp")
    private Instant timestamp;

    public BateriaStatus() {}

    public BateriaStatus(Long id, Long bateriaId, String flowState, Double voltage, Double current, Double frequency, Double power, Double soc, Double temperature, Long durationSeconds, Boolean esHoraValle, Boolean permiteCargar, Boolean permiteSuministrar, String puntoConexionNombre, Instant timestamp) {
        this.id = id;
        this.bateriaId = bateriaId;
        this.flowState = flowState;
        this.voltage = voltage;
        this.current = current;
        this.frequency = frequency;
        this.power = power;
        this.soc = soc;
        this.temperature = temperature;
        this.durationSeconds = durationSeconds;
        this.esHoraValle = esHoraValle;
        this.permiteCargar = permiteCargar;
        this.permiteSuministrar = permiteSuministrar;
        this.puntoConexionNombre = puntoConexionNombre;
        this.timestamp = timestamp;
    }

    // Helper for formatting duration
    public String getFormattedDuration() {
        if (formattedDuration != null) return formattedDuration;
        if (durationSeconds == null || durationSeconds <= 0) return "0s";
        long hrs = durationSeconds / 3600;
        long mins = (durationSeconds % 3600) / 60;
        long secs = durationSeconds % 60;
        if (hrs > 0) {
            return String.format("%dh %dm %ds", hrs, mins, secs);
        } else if (mins > 0) {
            return String.format("%dm %ds", mins, secs);
        } else {
            return String.format("%ds", secs);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBateriaId() { return bateriaId; }
    public void setBateriaId(Long bateriaId) { this.bateriaId = bateriaId; }

    public String getFlowState() { return flowState; }
    public void setFlowState(String flowState) { this.flowState = flowState; }

    public Double getVoltage() { return voltage; }
    public void setVoltage(Double voltage) { this.voltage = voltage; }

    public Double getCurrent() { return current; }
    public void setCurrent(Double current) { this.current = current; }

    public Double getFrequency() { return frequency; }
    public void setFrequency(Double frequency) { this.frequency = frequency; }

    public Double getPower() { return power; }
    public void setPower(Double power) { this.power = power; }

    public Double getSoc() { return soc; }
    public void setSoc(Double soc) { this.soc = soc; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }

    public void setFormattedDuration(String formattedDuration) { this.formattedDuration = formattedDuration; }

    public Boolean getEsHoraValle() { return esHoraValle; }
    public void setEsHoraValle(Boolean esHoraValle) { this.esHoraValle = esHoraValle; }

    public Boolean getPermiteCargar() { return permiteCargar; }
    public void setPermiteCargar(Boolean permiteCargar) { this.permiteCargar = permiteCargar; }

    public Boolean getPermiteSuministrar() { return permiteSuministrar; }
    public void setPermiteSuministrar(Boolean permiteSuministrar) { this.permiteSuministrar = permiteSuministrar; }

    public String getPuntoConexionNombre() { return puntoConexionNombre; }
    public void setPuntoConexionNombre(String puntoConexionNombre) { this.puntoConexionNombre = puntoConexionNombre; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
