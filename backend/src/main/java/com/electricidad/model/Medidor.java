package com.electricidad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "CONTADOR")
public class Medidor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medidor_seq")
    @SequenceGenerator(name = "medidor_seq", sequenceName = "SEQ_CONTADOR", allocationSize = 1)
    private Long id;

    @Column(name = "numero_serie", nullable = false, unique = true)
    private String numeroSerie;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Transient
    private TipoTarifa tipoTarifa = TipoTarifa.RESIDENCIAL;

    @Transient
    private boolean activo = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plc_id")
    private Plc plc;

    @Column(name = "voltaje")
    private double voltaje;

    @Column(name = "corriente")
    private double corriente;

    @Column(name = "potencia")
    private double potencia;

    @Column(name = "frecuencia")
    private double frecuencia;

    @Column(name = "estado_conexion")
    private String estadoConexion;

    // Constructors
    public Medidor() {}

    public Medidor(Long id, String numeroSerie, TipoTarifa tipoTarifa, boolean activo, Cliente cliente, String ubicacion) {
        this.id = id;
        this.numeroSerie = numeroSerie;
        this.tipoTarifa = tipoTarifa;
        this.activo = activo;
        this.cliente = cliente;
        this.ubicacion = ubicacion;
    }

    public Medidor(Long id, String numeroSerie, TipoTarifa tipoTarifa, boolean activo, Cliente cliente, String ubicacion, Plc plc, double voltaje, double corriente, double potencia, double frecuencia, String estadoConexion) {
        this.id = id;
        this.numeroSerie = numeroSerie;
        this.tipoTarifa = tipoTarifa;
        this.activo = activo;
        this.cliente = cliente;
        this.ubicacion = ubicacion;
        this.plc = plc;
        this.voltaje = voltaje;
        this.corriente = corriente;
        this.potencia = potencia;
        this.frecuencia = frecuencia;
        this.estadoConexion = estadoConexion;
    }

    // Builder manual
    public static MedidorBuilder builder() {
        return new MedidorBuilder();
    }

    public static class MedidorBuilder {
        private Long id;
        private String numeroSerie;
        private TipoTarifa tipoTarifa;
        private boolean activo;
        private Cliente cliente;
        private String ubicacion;
        private Plc plc;
        private double voltaje;
        private double corriente;
        private double potencia;
        private double frecuencia;
        private String estadoConexion;

        public MedidorBuilder id(Long id) { this.id = id; return this; }
        public MedidorBuilder numeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; return this; }
        public MedidorBuilder tipoTarifa(TipoTarifa tipoTarifa) { this.tipoTarifa = tipoTarifa; return this; }
        public MedidorBuilder activo(boolean activo) { this.activo = activo; return this; }
        public MedidorBuilder cliente(Cliente cliente) { this.cliente = cliente; return this; }
        public MedidorBuilder ubicacion(String ubicacion) { this.ubicacion = ubicacion; return this; }
        public MedidorBuilder plc(Plc plc) { this.plc = plc; return this; }
        public MedidorBuilder voltaje(double voltaje) { this.voltaje = voltaje; return this; }
        public MedidorBuilder corriente(double corriente) { this.corriente = corriente; return this; }
        public MedidorBuilder potencia(double potencia) { this.potencia = potencia; return this; }
        public MedidorBuilder frecuencia(double frecuencia) { this.frecuencia = frecuencia; return this; }
        public MedidorBuilder estadoConexion(String estadoConexion) { this.estadoConexion = estadoConexion; return this; }

        public Medidor build() {
            return new Medidor(id, numeroSerie, tipoTarifa, activo, cliente, ubicacion, plc, voltaje, corriente, potencia, frecuencia, estadoConexion);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }
    public TipoTarifa getTipoTarifa() { return tipoTarifa; }
    public void setTipoTarifa(TipoTarifa tipoTarifa) { this.tipoTarifa = tipoTarifa; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public Plc getPlc() { return plc; }
    public void setPlc(Plc plc) { this.plc = plc; }
    public double getVoltaje() { return voltaje; }
    public void setVoltaje(double voltaje) { this.voltaje = voltaje; }
    public double getCorriente() { return corriente; }
    public void setCorriente(double corriente) { this.corriente = corriente; }
    public double getPotencia() { return potencia; }
    public void setPotencia(double potencia) { this.potencia = potencia; }
    public double getFrecuencia() { return frecuencia; }
    public void setFrecuencia(double frecuencia) { this.frecuencia = frecuencia; }
    public String getEstadoConexion() { return estadoConexion; }
    public void setEstadoConexion(String estadoConexion) { this.estadoConexion = estadoConexion; }
}
