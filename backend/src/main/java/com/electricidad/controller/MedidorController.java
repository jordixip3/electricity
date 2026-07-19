package com.electricidad.controller;

import com.electricidad.model.Lectura;
import com.electricidad.model.Medidor;
import com.electricidad.service.ElectricidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/medidores")
public class MedidorController {

    private final ElectricidadService electricidadService;

    // Constructor injection
    public MedidorController(ElectricidadService electricidadService) {
        this.electricidadService = electricidadService;
    }

    @GetMapping
    public List<Medidor> listMedidores(@RequestParam(required = false) Long clienteId) {
        List<Medidor> medidores;
        if (clienteId != null) {
            medidores = electricidadService.getMedidoresPorCliente(clienteId);
        } else {
            medidores = electricidadService.getTodosMedidores();
        }

        // Simular fluctuación SCADA en tiempo real para contadores conectados
        for (Medidor m : medidores) {
            if ("CONECTADO".equals(m.getEstadoConexion())) {
                double baseV = m.getVoltaje() > 100.0 ? m.getVoltaje() : 230.0;
                double baseC = m.getCorriente() > 0.05 ? m.getCorriente() : 5.0;
                double baseF = m.getFrecuencia() > 45.0 ? m.getFrecuencia() : 50.0;

                double vFluct = baseV + (Math.random() - 0.5) * 3.0; // +/- 1.5V
                double cFluct = baseC + (Math.random() - 0.5) * 0.8; // +/- 0.4A
                if (cFluct < 0.1) cFluct = 0.1;
                double pFluct = (vFluct * cFluct) / 1000.0; // kW
                double fFluct = baseF + (Math.random() - 0.5) * 0.04; // +/- 0.02Hz

                m.setVoltaje(Math.round(vFluct * 100.0) / 100.0);
                m.setCorriente(Math.round(cFluct * 100.0) / 100.0);
                m.setPotencia(Math.round(pFluct * 1000.0) / 1000.0);
                m.setFrecuencia(Math.round(fFluct * 100.0) / 100.0);
            } else {
                m.setVoltaje(0.0);
                m.setCorriente(0.0);
                m.setPotencia(0.0);
                m.setFrecuencia(50.0);
            }
        }

        return medidores;
    }

    @PutMapping("/{id}/conexion")
    public ResponseEntity<?> updateConexion(@PathVariable Long id, @RequestParam String estadoConexion) {
        try {
            electricidadService.actualizarEstadoConexionMedidor(id, estadoConexion);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createMedidor(@RequestBody Medidor medidor) {
        try {
            Medidor nuevoMedidor = electricidadService.crearMedidor(medidor);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMedidor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> darDeBajaMedidor(@PathVariable Long id) {
        try {
            electricidadService.darDeBajaMedidor(id);
            return ResponseEntity.ok().body("Contador dado de baja correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/lecturas")
    public List<Lectura> getLecturas(@PathVariable Long id) {
        return electricidadService.getLecturasPorMedidor(id);
    }

    @PostMapping("/{id}/lecturas")
    public ResponseEntity<?> registrarLectura(@PathVariable Long id, @RequestBody LecturaRequest request) {
        try {
            LocalDate fecha = request.getFecha() != null ? request.getFecha() : LocalDate.now();
            Lectura nuevaLectura = electricidadService.registrarLectura(id, request.getValor(), fecha);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaLectura);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Manual Request DTO class with explicit getters and setters
    public static class LecturaRequest {
        private double valor;
        private LocalDate fecha;

        public double getValor() {
            return valor;
        }

        public void setValor(double valor) {
            this.valor = valor;
        }

        public LocalDate getFecha() {
            return fecha;
        }

        public void setFecha(LocalDate fecha) {
            this.fecha = fecha;
        }
    }
}
