package com.electricidad.controller;

import com.electricidad.model.BateriaStatus;
import com.electricidad.service.BatteryMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/baterias")
public class BatteryController {

    private final BatteryMonitoringService batteryMonitoringService;

    public BatteryController(BatteryMonitoringService batteryMonitoringService) {
        this.batteryMonitoringService = batteryMonitoringService;
    }

    @GetMapping("/status")
    public ResponseEntity<List<BateriaStatus>> getLatestStatus() {
        List<BateriaStatus> statusList = batteryMonitoringService.getLatestBatteryStatus();
        return ResponseEntity.ok(statusList);
    }

    @GetMapping("/history")
    public ResponseEntity<List<BateriaStatus>> getHistoricalStatus(
            @RequestParam(defaultValue = "60") int days,
            @RequestParam(required = false) Long bateriaId) {
        List<BateriaStatus> history = batteryMonitoringService.getHistoricalBatteryStatus(days, bateriaId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/{id}/modo")
    public ResponseEntity<BateriaStatus> setBateriaModo(
            @PathVariable Long id,
            @RequestParam String modo) {
        BateriaStatus status = batteryMonitoringService.setBateriaModoOperacion(id, modo);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/{id}/punto-conexion")
    public ResponseEntity<Map<String, Object>> updatePuntoConexion(
            @PathVariable Long id,
            @RequestParam boolean permiteCargar,
            @RequestParam boolean permiteSuministrar) {
        batteryMonitoringService.updatePuntoConexionPermisos(id, permiteCargar, permiteSuministrar);
        return ResponseEntity.ok(Map.of(
            "bateriaId", id,
            "permiteCargar", permiteCargar,
            "permiteSuministrar", permiteSuministrar,
            "message", "Punto de conexión actualizado correctamente"
        ));
    }
}
