package com.electricidad.controller;

import com.electricidad.model.Lectura;
import com.electricidad.repository.LecturaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lecturas")
public class LecturaController {

    private final LecturaRepository lecturaRepository;

    public LecturaController(LecturaRepository lecturaRepository) {
        this.lecturaRepository = lecturaRepository;
    }

    /**
     * GET /api/lecturas/analytics
     * Returns daily aggregated telemetry grouped by fecha_lectura.
     *
     * @param plcId      optional PLC filter
     * @param fechaInicio start date (default: 30 days ago)
     * @param fechaFin    end date   (default: today)
     */
    @GetMapping("/analytics")
    public List<Map<String, Object>> getAnalytics(
            @RequestParam(required = false) Long plcId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        LocalDate to   = fechaFin   != null ? fechaFin   : LocalDate.now();
        LocalDate from = fechaInicio != null ? fechaInicio : to.minusDays(30);

        List<Lectura> lecturas = plcId != null
                ? lecturaRepository.findByPlcAndFechaRange(plcId, from, to)
                : lecturaRepository.findByFechaRange(from, to);

        // Group by date and compute daily aggregates
        Map<LocalDate, List<Lectura>> byDay = lecturas.stream()
                .collect(Collectors.groupingBy(Lectura::getFechaLectura));

        return byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    LocalDate day = entry.getKey();
                    List<Lectura> dayLecturas = entry.getValue();

                    double avgVoltaje  = dayLecturas.stream().mapToDouble(l -> l.getVoltaje()   != null ? l.getVoltaje()   : 0).average().orElse(0);
                    double avgCorriente= dayLecturas.stream().mapToDouble(l -> l.getCorriente()  != null ? l.getCorriente() : 0).average().orElse(0);
                    double sumPotencia = dayLecturas.stream().mapToDouble(l -> l.getPotencia()   != null ? l.getPotencia()  : 0).sum();
                    double avgFrecuencia= dayLecturas.stream().mapToDouble(l -> l.getFrecuencia()!= null ? l.getFrecuencia(): 0).average().orElse(0);
                    double sumConsumo   = dayLecturas.stream().mapToDouble(Lectura::getValorConsumoKwH).sum();
                    long   countMedidores = dayLecturas.stream()
                            .map(l -> l.getMedidor().getId()).distinct().count();

                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("fecha",         day.toString());
                    point.put("avgVoltaje",    Math.round(avgVoltaje    * 100.0) / 100.0);
                    point.put("avgCorriente",  Math.round(avgCorriente  * 100.0) / 100.0);
                    point.put("sumPotencia",   Math.round(sumPotencia   * 100.0) / 100.0);
                    point.put("avgFrecuencia", Math.round(avgFrecuencia * 100.0) / 100.0);
                    point.put("sumConsumo",    Math.round(sumConsumo    * 100.0) / 100.0);
                    point.put("medidoresActivos", countMedidores);
                    return point;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET /api/lecturas/top-consumidores
     * Returns top N meters by total consumption in the date range.
     */
    @GetMapping("/top-consumidores")
    public List<Map<String, Object>> getTopConsumidores(
            @RequestParam(required = false) Long plcId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(defaultValue = "10") int top) {

        LocalDate to   = fechaFin   != null ? fechaFin   : LocalDate.now();
        LocalDate from = fechaInicio != null ? fechaInicio : to.minusDays(30);

        List<Lectura> lecturas = plcId != null
                ? lecturaRepository.findByPlcAndFechaRange(plcId, from, to)
                : lecturaRepository.findByFechaRange(from, to);

        // Group by medidor and sum consumo
        return lecturas.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getMedidor().getId(),
                        Collectors.summarizingDouble(Lectura::getValorConsumoKwH)))
                .entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue().getSum(), a.getValue().getSum()))
                .limit(top)
                .map(entry -> {
                    // Find one lectura to get the meter info
                    Lectura sample = lecturas.stream()
                            .filter(l -> l.getMedidor().getId().equals(entry.getKey()))
                            .findFirst().orElse(null);

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("medidorId", entry.getKey());
                    row.put("numeroSerie", sample != null ? sample.getMedidor().getNumeroSerie() : "");
                    row.put("plcNombre",   sample != null && sample.getMedidor().getPlc() != null
                            ? sample.getMedidor().getPlc().getNombre() : "Sin PLC");
                    row.put("totalConsumo", Math.round(entry.getValue().getSum() * 100.0) / 100.0);
                    return row;
                })
                .collect(Collectors.toList());
    }
}
