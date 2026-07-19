package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "INCIDENCIA")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "incidencia_seq")
    @SequenceGenerator(name = "incidencia_seq", sequenceName = "SEQ_INCIDENCIA", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contador_id", nullable = false)
    private Medidor medidor;

    @Column(name = "fecha_incidencia", nullable = false)
    private LocalDate fechaIncidencia;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "estado", length = 20)
    private String estado; // e.g., "ABIERTA", "RESUELTA"

    // Constructors
    public Incidencia() {}

    public Incidencia(Long id, Medidor medidor, LocalDate fechaIncidencia, String descripcion, String estado) {
        this.id = id;
        this.medidor = medidor;
        this.fechaIncidencia = fechaIncidencia;
        this.descripcion = descripcion;
        this.estado = estado;
    }

    // Builder manual
    public static IncidenciaBuilder builder() {
        return new IncidenciaBuilder();
    }

    public static class IncidenciaBuilder {
        private Long id;
        private Medidor medidor;
        private LocalDate fechaIncidencia;
        private String descripcion;
        private String estado;

        public IncidenciaBuilder id(Long id) { this.id = id; return this; }
        public IncidenciaBuilder medidor(Medidor medidor) { this.medidor = medidor; return this; }
        public IncidenciaBuilder fechaIncidencia(LocalDate fechaIncidencia) { this.fechaIncidencia = fechaIncidencia; return this; }
        public IncidenciaBuilder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public IncidenciaBuilder estado(String estado) { this.estado = estado; return this; }

        public Incidencia build() {
            return new Incidencia(id, medidor, fechaIncidencia, descripcion, estado);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Medidor getMedidor() { return medidor; }
    public void setMedidor(Medidor medidor) { this.medidor = medidor; }
    public LocalDate getFechaIncidencia() { return fechaIncidencia; }
    public void setFechaIncidencia(LocalDate fechaIncidencia) { this.fechaIncidencia = fechaIncidencia; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
