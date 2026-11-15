package com.electricidad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "PUNTO_CONEXION")
public class PuntoConexion {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "punto_conexion_seq")
    @SequenceGenerator(name = "punto_conexion_seq", sequenceName = "SEQ_PUNTO_CONEXION", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "capacidad_max_mw", nullable = false)
    private double capacidadMaxMw;

    @Column(name = "tension_kv", nullable = false)
    private double tensionKv;

    private String ubicacion;

    @Column(nullable = false, length = 20)
    private String estado = "DISPONIBLE"; // e.g. DISPONIBLE, EN_USO

    @Column(name = "permite_cargar", nullable = false)
    private boolean permiteCargar = true;

    @Column(name = "permite_suministrar", nullable = false)
    private boolean permiteSuministrar = true;

    @Column(name = "horario_valle_inicio", length = 10)
    private String horarioValleInicio = "00:00";

    @Column(name = "horario_valle_fin", length = 10)
    private String horarioValleFin = "08:00";

    public PuntoConexion() {}

    public PuntoConexion(Long id, String nombre, double capacidadMaxMw, double tensionKv, String ubicacion, String estado, boolean permiteCargar, boolean permiteSuministrar, String horarioValleInicio, String horarioValleFin) {
        this.id = id;
        this.nombre = nombre;
        this.capacidadMaxMw = capacidadMaxMw;
        this.tensionKv = tensionKv;
        this.ubicacion = ubicacion;
        this.estado = estado;
        this.permiteCargar = permiteCargar;
        this.permiteSuministrar = permiteSuministrar;
        this.horarioValleInicio = horarioValleInicio;
        this.horarioValleFin = horarioValleFin;
    }

    public static PuntoConexionBuilder builder() {
        return new PuntoConexionBuilder();
    }

    public static class PuntoConexionBuilder {
        private Long id;
        private String nombre;
        private double capacidadMaxMw;
        private double tensionKv;
        private String ubicacion;
        private String estado;
        private boolean permiteCargar = true;
        private boolean permiteSuministrar = true;
        private String horarioValleInicio = "00:00";
        private String horarioValleFin = "08:00";

        public PuntoConexionBuilder id(Long id) { this.id = id; return this; }
        public PuntoConexionBuilder nombre(String nombre) { this.nombre = nombre; return this; }
        public PuntoConexionBuilder capacidadMaxMw(double capacidadMaxMw) { this.capacidadMaxMw = capacidadMaxMw; return this; }
        public PuntoConexionBuilder tensionKv(double tensionKv) { this.tensionKv = tensionKv; return this; }
        public PuntoConexionBuilder ubicacion(String ubicacion) { this.ubicacion = ubicacion; return this; }
        public PuntoConexionBuilder estado(String estado) { this.estado = estado; return this; }
        public PuntoConexionBuilder permiteCargar(boolean permiteCargar) { this.permiteCargar = permiteCargar; return this; }
        public PuntoConexionBuilder permiteSuministrar(boolean permiteSuministrar) { this.permiteSuministrar = permiteSuministrar; return this; }
        public PuntoConexionBuilder horarioValleInicio(String horarioValleInicio) { this.horarioValleInicio = horarioValleInicio; return this; }
        public PuntoConexionBuilder horarioValleFin(String horarioValleFin) { this.horarioValleFin = horarioValleFin; return this; }

        public PuntoConexion build() {
            return new PuntoConexion(id, nombre, capacidadMaxMw, tensionKv, ubicacion, estado, permiteCargar, permiteSuministrar, horarioValleInicio, horarioValleFin);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getCapacidadMaxMw() { return capacidadMaxMw; }
    public void setCapacidadMaxMw(double capacidadMaxMw) { this.capacidadMaxMw = capacidadMaxMw; }
    public double getTensionKv() { return tensionKv; }
    public void setTensionKv(double tensionKv) { this.tensionKv = tensionKv; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public boolean isPermiteCargar() { return permiteCargar; }
    public void setPermiteCargar(boolean permiteCargar) { this.permiteCargar = permiteCargar; }
    public boolean isPermiteSuministrar() { return permiteSuministrar; }
    public void setPermiteSuministrar(boolean permiteSuministrar) { this.permiteSuministrar = permiteSuministrar; }
    public String getHorarioValleInicio() { return horarioValleInicio; }
    public void setHorarioValleInicio(String horarioValleInicio) { this.horarioValleInicio = horarioValleInicio; }
    public String getHorarioValleFin() { return horarioValleFin; }
    public void setHorarioValleFin(String horarioValleFin) { this.horarioValleFin = horarioValleFin; }
}
