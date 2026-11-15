package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "MEDIDOR")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Medidor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medidor_seq")
    @SequenceGenerator(name = "medidor_seq", sequenceName = "SEQ_MEDIDOR", allocationSize = 1)
    private Long id;

    @Column(name = "numero_serie", nullable = false, unique = true)
    private String numeroSerie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plc_id")
    private Plc plc;

    @Column(nullable = false)
    private boolean activo = false;

    @Column(name = "estado_conexion", length = 20)
    private String estadoConexion = "CONECTADO"; // CONECTADO, DESCONECTADO

    // Measurement fields (optional, can be null initially)
    private Double voltaje;
    private Double corriente;
    private Double potencia;
    private Double frecuencia;
    private Double temperatura;

    // Constructors
    public Medidor() {}

    public Medidor(Long id, String numeroSerie, Cliente cliente, boolean activo, String estadoConexion) {
        this.id = id;
        this.numeroSerie = numeroSerie;
        this.cliente = cliente;
        this.activo = activo;
        this.estadoConexion = estadoConexion;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Plc getPlc() { return plc; }
    public void setPlc(Plc plc) { this.plc = plc; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public String getEstadoConexion() { return estadoConexion; }
    public void setEstadoConexion(String estadoConexion) { this.estadoConexion = estadoConexion; }

    public Double getVoltaje() { return voltaje; }
    public void setVoltaje(Double voltaje) { this.voltaje = voltaje; }

    public Double getCorriente() { return corriente; }
    public void setCorriente(Double corriente) { this.corriente = corriente; }

    public Double getPotencia() { return potencia; }
    public void setPotencia(Double potencia) { this.potencia = potencia; }

    public Double getFrecuencia() { return frecuencia; }
    public void setFrecuencia(Double frecuencia) { this.frecuencia = frecuencia; }

    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }
}
