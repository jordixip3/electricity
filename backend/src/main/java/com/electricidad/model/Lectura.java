package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "LECTURA")
public class Lectura {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lectura_seq")
    @SequenceGenerator(name = "lectura_seq", sequenceName = "SEQ_LECTURA", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contador_id", nullable = false)
    private Medidor medidor;

    @Column(name = "consumo", nullable = false)
    private double valorConsumoKwH;

    @Column(name = "fecha_lectura", nullable = false)
    private LocalDate fechaLectura;

    // Constructors
    public Lectura() {}

    public Lectura(Long id, Medidor medidor, double valorConsumoKwH, LocalDate fechaLectura) {
        this.id = id;
        this.medidor = medidor;
        this.valorConsumoKwH = valorConsumoKwH;
        this.fechaLectura = fechaLectura;
    }

    // Builder manual
    public static LecturaBuilder builder() {
        return new LecturaBuilder();
    }

    public static class LecturaBuilder {
        private Long id;
        private Medidor medidor;
        private double valorConsumoKwH;
        private LocalDate fechaLectura;

        public LecturaBuilder id(Long id) { this.id = id; return this; }
        public LecturaBuilder medidor(Medidor medidor) { this.medidor = medidor; return this; }
        public LecturaBuilder valorConsumoKwH(double valorConsumoKwH) { this.valorConsumoKwH = valorConsumoKwH; return this; }
        public LecturaBuilder fechaLectura(LocalDate fechaLectura) { this.fechaLectura = fechaLectura; return this; }

        public Lectura build() {
            return new Lectura(id, medidor, valorConsumoKwH, fechaLectura);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Medidor getMedidor() { return medidor; }
    public void setMedidor(Medidor medidor) { this.medidor = medidor; }
    public double getValorConsumoKwH() { return valorConsumoKwH; }
    public void setValorConsumoKwH(double valorConsumoKwH) { this.valorConsumoKwH = valorConsumoKwH; }
    public LocalDate getFechaLectura() { return fechaLectura; }
    public void setFechaLectura(LocalDate fechaLectura) { this.fechaLectura = fechaLectura; }
}
