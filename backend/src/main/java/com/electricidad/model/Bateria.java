package com.electricidad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "BATERIA")
public class Bateria {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bateria_seq")
    @SequenceGenerator(name = "bateria_seq", sequenceName = "SEQ_BATERIA", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "capacidad_mw", nullable = false)
    private double capacidadMw;

    @Column(name = "capacidad_mwh", nullable = false)
    private double capacidadMwh;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_bateria", nullable = false)
    private TipoBateria tipoBateria = TipoBateria.LFP;

    @Column(nullable = false)
    private double soc;

    @Column(nullable = false, length = 20)
    private String estado = "STANDBY"; // CARGANDO, DESCARGANDO, STANDBY, MANTENIMIENTO, ERROR

    private Double voltaje;
    private Double corriente;
    private Double potencia;
    private Double frecuencia;
    private Double temperatura;

    @Column(name = "estado_conexion", length = 20)
    private String estadoConexion = "CONECTADO"; // CONECTADO, DESCONECTADO

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "punto_conexion_id", nullable = false)
    private PuntoConexion puntoConexion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plc_id")
    private Plc plc;

    public Bateria() {}

    public Bateria(Long id, String nombre, double capacidadMw, double capacidadMwh, TipoBateria tipoBateria, double soc, String estado, Double voltaje, Double corriente, Double potencia, Double frecuencia, Double temperatura, String estadoConexion, PuntoConexion puntoConexion, Plc plc) {
        this.id = id;
        this.nombre = nombre;
        this.capacidadMw = capacidadMw;
        this.capacidadMwh = capacidadMwh;
        this.tipoBateria = tipoBateria;
        this.soc = soc;
        this.estado = estado;
        this.voltaje = voltaje;
        this.corriente = corriente;
        this.potencia = potencia;
        this.frecuencia = frecuencia;
        this.temperatura = temperatura;
        this.estadoConexion = estadoConexion;
        this.puntoConexion = puntoConexion;
        this.plc = plc;
    }

    public static BateriaBuilder builder() {
        return new BateriaBuilder();
    }

    public static class BateriaBuilder {
        private Long id;
        private String nombre;
        private double capacidadMw;
        private double capacidadMwh;
        private TipoBateria tipoBateria;
        private double soc;
        private String estado;
        private Double voltaje;
        private Double corriente;
        private Double potencia;
        private Double frecuencia;
        private Double temperatura;
        private String estadoConexion;
        private PuntoConexion puntoConexion;
        private Plc plc;

        public BateriaBuilder id(Long id) { this.id = id; return this; }
        public BateriaBuilder nombre(String nombre) { this.nombre = nombre; return this; }
        public BateriaBuilder capacidadMw(double capacidadMw) { this.capacidadMw = capacidadMw; return this; }
        public BateriaBuilder capacidadMwh(double capacidadMwh) { this.capacidadMwh = capacidadMwh; return this; }
        public BateriaBuilder tipoBateria(TipoBateria tipoBateria) { this.tipoBateria = tipoBateria; return this; }
        public BateriaBuilder soc(double soc) { this.soc = soc; return this; }
        public BateriaBuilder estado(String estado) { this.estado = estado; return this; }
        public BateriaBuilder voltaje(Double voltaje) { this.voltaje = voltaje; return this; }
        public BateriaBuilder corriente(Double corriente) { this.corriente = corriente; return this; }
        public BateriaBuilder potencia(Double potencia) { this.potencia = potencia; return this; }
        public BateriaBuilder frecuencia(Double frecuencia) { this.frecuencia = frecuencia; return this; }
        public BateriaBuilder temperatura(Double temperatura) { this.temperatura = temperatura; return this; }
        public BateriaBuilder estadoConexion(String estadoConexion) { this.estadoConexion = estadoConexion; return this; }
        public BateriaBuilder puntoConexion(PuntoConexion puntoConexion) { this.puntoConexion = puntoConexion; return this; }
        public BateriaBuilder plc(Plc plc) { this.plc = plc; return this; }

        public Bateria build() {
            return new Bateria(id, nombre, capacidadMw, capacidadMwh, tipoBateria, soc, estado, voltaje, corriente, potencia, frecuencia, temperatura, estadoConexion, puntoConexion, plc);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getCapacidadMw() { return capacidadMw; }
    public void setCapacidadMw(double capacidadMw) { this.capacidadMw = capacidadMw; }
    public double getCapacidadMwh() { return capacidadMwh; }
    public void setCapacidadMwh(double capacidadMwh) { this.capacidadMwh = capacidadMwh; }
    public TipoBateria getTipoBateria() { return tipoBateria; }
    public void setTipoBateria(TipoBateria tipoBateria) { this.tipoBateria = tipoBateria; }
    public double getSoc() { return soc; }
    public void setSoc(double soc) { this.soc = soc; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
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
    public String getEstadoConexion() { return estadoConexion; }
    public void setEstadoConexion(String estadoConexion) { this.estadoConexion = estadoConexion; }
    public PuntoConexion getPuntoConexion() { return puntoConexion; }
    public void setPuntoConexion(PuntoConexion puntoConexion) { this.puntoConexion = puntoConexion; }
    public Plc getPlc() { return plc; }
    public void setPlc(Plc plc) { this.plc = plc; }
}
