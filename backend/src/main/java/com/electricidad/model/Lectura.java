package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "LECTURA")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Lectura {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lectura_seq")
    @SequenceGenerator(name = "lectura_seq", sequenceName = "SEQ_LECTURA", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medidor_id", nullable = false)
    private Medidor medidor;

    @Column(name = "consumo", nullable = false)
    private double valorConsumoKwH;

    @Column(name = "fecha_lectura", nullable = false)
    private LocalDate fechaLectura;

    private Double soc;
    private Double voltaje;
    private Double corriente;
    private Double potencia;
    private Double frecuencia;
    private Double temperatura;

    public Lectura() {}

    public Lectura(Long id, Medidor medidor, double valorConsumoKwH, LocalDate fechaLectura) {
        this.id = id;
        this.medidor = medidor;
        this.valorConsumoKwH = valorConsumoKwH;
        this.fechaLectura = fechaLectura;
    }

    public static LecturaBuilder builder() {
        return new LecturaBuilder();
    }

    public static class LecturaBuilder {
        private Long id;
        private Medidor medidor;
        private double valorConsumoKwH;
        private LocalDate fechaLectura;
        private Double soc;
        private Double voltaje;
        private Double corriente;
        private Double potencia;
        private Double frecuencia;
        private Double temperatura;

        public LecturaBuilder id(Long id) { this.id = id; return this; }
        public LecturaBuilder medidor(Medidor medidor) { this.medidor = medidor; return this; }
        public LecturaBuilder valorConsumoKwH(double valorConsumoKwH) { this.valorConsumoKwH = valorConsumoKwH; return this; }
        public LecturaBuilder fechaLectura(LocalDate fechaLectura) { this.fechaLectura = fechaLectura; return this; }
        public LecturaBuilder soc(Double soc) { this.soc = soc; return this; }
        public LecturaBuilder voltaje(Double voltaje) { this.voltaje = voltaje; return this; }
        public LecturaBuilder corriente(Double corriente) { this.corriente = corriente; return this; }
        public LecturaBuilder potencia(Double potencia) { this.potencia = potencia; return this; }
        public LecturaBuilder frecuencia(Double frecuencia) { this.frecuencia = frecuencia; return this; }
        public LecturaBuilder temperatura(Double temperatura) { this.temperatura = temperatura; return this; }

        public Lectura build() {
            Lectura l = new Lectura(id, medidor, valorConsumoKwH, fechaLectura);
            l.soc = soc;
            l.voltaje = voltaje;
            l.corriente = corriente;
            l.potencia = potencia;
            l.frecuencia = frecuencia;
            l.temperatura = temperatura;
            return l;
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
    public Double getSoc() { return soc; }
    public void setSoc(Double soc) { this.soc = soc; }
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
