package com.electricidad.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PLC")
public class Plc {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "plc_seq")
    @SequenceGenerator(name = "plc_seq", sequenceName = "SEQ_PLC", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String ip;

    @Column(nullable = false)
    private String estado = "ONLINE";

    @Column(nullable = false)
    private String ubicacion;

    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion = LocalDateTime.now();

    public Plc() {}

    public Plc(Long id, String nombre, String ip, String estado, String ubicacion, LocalDateTime ultimaConexion) {
        this.id = id;
        this.nombre = nombre;
        this.ip = ip;
        this.estado = estado;
        this.ubicacion = ubicacion;
        this.ultimaConexion = ultimaConexion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public LocalDateTime getUltimaConexion() { return ultimaConexion; }
    public void setUltimaConexion(LocalDateTime ultimaConexion) { this.ultimaConexion = ultimaConexion; }
}
