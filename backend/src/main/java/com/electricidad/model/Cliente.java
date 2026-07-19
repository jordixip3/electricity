package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "CLIENTE")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cliente_seq")
    @SequenceGenerator(name = "cliente_seq", sequenceName = "SEQ_CLIENTE", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    private String telefono;

    @Transient
    private String direccion;

    @Transient
    private LocalDate fechaAlta;

    // Constructors
    public Cliente() {}

    public Cliente(Long id, String nombre, String email, String telefono, String direccion, LocalDate fechaAlta) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.fechaAlta = fechaAlta;
    }

    // Builder manual
    public static ClienteBuilder builder() {
        return new ClienteBuilder();
    }

    public static class ClienteBuilder {
        private Long id;
        private String nombre;
        private String email;
        private String telefono;
        private String direccion;
        private LocalDate fechaAlta;

        public ClienteBuilder id(Long id) { this.id = id; return this; }
        public ClienteBuilder nombre(String nombre) { this.nombre = nombre; return this; }
        public ClienteBuilder email(String email) { this.email = email; return this; }
        public ClienteBuilder telefono(String telefono) { this.telefono = telefono; return this; }
        public ClienteBuilder direccion(String direccion) { this.direccion = direccion; return this; }
        public ClienteBuilder fechaAlta(LocalDate fechaAlta) { this.fechaAlta = fechaAlta; return this; }

        public Cliente build() {
            return new Cliente(id, nombre, email, telefono, direccion, fechaAlta);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public LocalDate getFechaAlta() { return fechaAlta; }
    public void setFechaAlta(LocalDate fechaAlta) { this.fechaAlta = fechaAlta; }
}
