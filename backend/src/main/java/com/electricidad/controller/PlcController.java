package com.electricidad.controller;

import com.electricidad.model.Plc;
import com.electricidad.service.ElectricidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plcs")
public class PlcController {

    private final ElectricidadService electricidadService;

    public PlcController(ElectricidadService electricidadService) {
        this.electricidadService = electricidadService;
    }

    @GetMapping
    public List<Plc> listPlcs() {
        return electricidadService.getTodosPlcs();
    }

    @PostMapping("/{id}/ping")
    public ResponseEntity<Plc> pingPlc(@PathVariable Long id) {
        try {
            Plc updated = electricidadService.pingPlc(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reboot")
    public ResponseEntity<Plc> rebootPlc(@PathVariable Long id) {
        try {
            Plc updated = electricidadService.reiniciarPlc(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
