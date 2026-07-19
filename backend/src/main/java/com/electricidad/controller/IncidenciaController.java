package com.electricidad.controller;

import com.electricidad.model.Incidencia;
import com.electricidad.service.ElectricidadService;
import com.electricidad.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/incidencias")
public class IncidenciaController {

    private final ElectricidadService electricidadService;
    private final ExportService exportService;

    public IncidenciaController(ElectricidadService electricidadService, ExportService exportService) {
        this.electricidadService = electricidadService;
        this.exportService = exportService;
    }

    @GetMapping
    public List<Incidencia> listIncidencias(@RequestParam(required = false) Long clienteId) {
        if (clienteId != null) {
            return electricidadService.getIncidenciasPorCliente(clienteId);
        }
        return electricidadService.getTodasIncidencias();
    }

    @PostMapping
    public ResponseEntity<?> createIncidencia(@RequestBody Incidencia incidencia) {
        try {
            Incidencia nueva = electricidadService.crearIncidencia(incidencia);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/resolver")
    public ResponseEntity<?> resolverIncidencia(@PathVariable Long id) {
        try {
            Incidencia resuelta = electricidadService.resolverIncidencia(id);
            return ResponseEntity.ok(resuelta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam(required = false) Long clienteId) {
        try {
            List<Incidencia> incidencias = clienteId != null
                    ? electricidadService.getIncidenciasPorCliente(clienteId)
                    : electricidadService.getTodasIncidencias();

            byte[] pdfBytes = exportService.exportIncidenciasToPdf(incidencias);
            String filename = "incidencias_" + LocalDate.now() + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestParam(required = false) Long clienteId) {
        try {
            List<Incidencia> incidencias = clienteId != null
                    ? electricidadService.getIncidenciasPorCliente(clienteId)
                    : electricidadService.getTodasIncidencias();

            byte[] excelBytes = exportService.exportIncidenciasToExcel(incidencias);
            String filename = "incidencias_" + LocalDate.now() + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
