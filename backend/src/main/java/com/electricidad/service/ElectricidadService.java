package com.electricidad.service;

import com.electricidad.model.*;
import com.electricidad.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ElectricidadService {

    private final ClienteRepository clienteRepository;
    private final MedidorRepository medidorRepository;
    private final LecturaRepository lecturaRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final PlcRepository plcRepository;

    // Constructor injection
    public ElectricidadService(ClienteRepository clienteRepository,
                              MedidorRepository medidorRepository,
                              LecturaRepository lecturaRepository,
                              IncidenciaRepository incidenciaRepository,
                              PlcRepository plcRepository) {
        this.clienteRepository = clienteRepository;
        this.medidorRepository = medidorRepository;
        this.lecturaRepository = lecturaRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.plcRepository = plcRepository;
    }

    // --- CLIENTE METHODS ---

    public List<Cliente> getTodosClientes() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> getClientePorId(Long id) {
        return clienteRepository.findById(id);
    }

    @Transactional
    public Cliente crearCliente(Cliente cliente) {
        if (clienteRepository.existsByEmail(cliente.getEmail())) {
            throw new IllegalArgumentException("Ya existe un cliente con el email: " + cliente.getEmail());
        }
        if (cliente.getFechaAlta() == null) {
            cliente.setFechaAlta(LocalDate.now());
        }
        return clienteRepository.save(cliente);
    }

    // --- MEDIDOR/CONTADOR METHODS ---

    public List<Medidor> getTodosMedidores() {
        return medidorRepository.findAll();
    }

    public List<Medidor> getMedidoresPorCliente(Long clienteId) {
        return medidorRepository.findByClienteId(clienteId);
    }

    @Transactional
    public Medidor crearMedidor(Medidor medidor) {
        if (medidorRepository.findByNumeroSerie(medidor.getNumeroSerie()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un medidor con el número de serie: " + medidor.getNumeroSerie());
        }
        Cliente cliente = clienteRepository.findById(medidor.getCliente().getId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        medidor.setCliente(cliente);
        medidor.setActivo(true);
        return medidorRepository.save(medidor);
    }

    @Transactional
    public void darDeBajaMedidor(Long medidorId) {
        Medidor medidor = medidorRepository.findById(medidorId)
                .orElseThrow(() -> new IllegalArgumentException("Contador no encontrado con id: " + medidorId));
        medidorRepository.delete(medidor);
    }


    // --- LECTURA METHODS ---

    public List<Lectura> getLecturasPorMedidor(Long medidorId) {
        return lecturaRepository.findByMedidorIdOrderByFechaLecturaDesc(medidorId);
    }

    @Transactional
    public Lectura registrarLectura(Long medidorId, double valorConsumoKwH, LocalDate fechaLectura) {
        Medidor medidor = medidorRepository.findById(medidorId)
                .orElseThrow(() -> new IllegalArgumentException("Medidor no encontrado"));

        List<Lectura> lecturasPrevias = lecturaRepository.findByMedidorIdOrderByFechaLecturaDesc(medidorId);

        if (!lecturasPrevias.isEmpty()) {
            Lectura ultimaLectura = lecturasPrevias.get(0);
            if (valorConsumoKwH < ultimaLectura.getValorConsumoKwH()) {
                throw new IllegalArgumentException("El valor de lectura actual (" + valorConsumoKwH 
                        + ") no puede ser menor que el de la última lectura (" + ultimaLectura.getValorConsumoKwH() + ")");
            }
            if (!fechaLectura.isAfter(ultimaLectura.getFechaLectura())) {
                throw new IllegalArgumentException("La fecha de la lectura debe ser posterior a la última lectura: " 
                        + ultimaLectura.getFechaLectura());
            }
        }

        Lectura lectura = Lectura.builder()
                .medidor(medidor)
                .valorConsumoKwH(valorConsumoKwH)
                .fechaLectura(fechaLectura)
                .build();
        return lecturaRepository.save(lectura);
    }

    // --- INCIDENCIA METHODS ---

    public List<Incidencia> getTodasIncidencias() {
        return incidenciaRepository.findAll();
    }

    public List<Incidencia> getIncidenciasPorCliente(Long clienteId) {
        return incidenciaRepository.findByMedidorClienteId(clienteId);
    }

    public List<Incidencia> getIncidenciasPorMedidor(Long medidorId) {
        return incidenciaRepository.findByMedidorId(medidorId);
    }

    @Transactional
    public Incidencia crearIncidencia(Incidencia incidencia) {
        Medidor medidor = medidorRepository.findById(incidencia.getMedidor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Contador no encontrado"));
        incidencia.setMedidor(medidor);
        if (incidencia.getFechaIncidencia() == null) {
            incidencia.setFechaIncidencia(LocalDate.now());
        }
        if (incidencia.getEstado() == null) {
            incidencia.setEstado("ABIERTA");
        }
        return incidenciaRepository.save(incidencia);
    }

    @Transactional
    public Incidencia resolverIncidencia(Long incidenciaId) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada"));
        incidencia.setEstado("RESUELTA");
        return incidenciaRepository.save(incidencia);
    }

    // --- PLC METHODS ---

    public List<Plc> getTodosPlcs() {
        return plcRepository.findAll();
    }

    public Optional<Plc> getPlcPorId(Long id) {
        return plcRepository.findById(id);
    }

    @Transactional
    public Plc pingPlc(Long id) {
        Plc plc = plcRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PLC no encontrado con id: " + id));
        plc.setUltimaConexion(java.time.LocalDateTime.now());
        plc.setEstado("ONLINE");
        return plcRepository.save(plc);
    }

    @Transactional
    public Plc reiniciarPlc(Long id) {
        Plc plc = plcRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PLC no encontrado con id: " + id));
        plc.setEstado("OFFLINE");
        plc.setUltimaConexion(java.time.LocalDateTime.now());
        Plc saved = plcRepository.save(plc);

        // In a real SCADA system this would trigger an async reconnect.
        // We will return it, and let the controller or frontend handle the temporary state.
        return saved;
    }

    @Transactional
    public void actualizarEstadoConexionMedidor(Long medidorId, String estadoConexion) {
        Medidor medidor = medidorRepository.findById(medidorId)
                .orElseThrow(() -> new IllegalArgumentException("Contador no encontrado con id: " + medidorId));
        medidor.setEstadoConexion(estadoConexion);
        if ("DESCONECTADO".equals(estadoConexion)) {
            medidor.setVoltaje(0.0);
            medidor.setCorriente(0.0);
            medidor.setPotencia(0.0);
        } else {
            // Restore reasonable defaults
            medidor.setVoltaje(round(220.0 + Math.random() * 20.0, 2));
            medidor.setCorriente(round(1.0 + Math.random() * 10.0, 2));
            medidor.setPotencia(round((medidor.getVoltaje() * medidor.getCorriente()) / 1000.0, 3));
            medidor.setFrecuencia(round(49.9 + Math.random() * 0.2, 2));
        }
        medidorRepository.save(medidor);
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        long factor = (long) Math.pow(10, places);
        value = value * factor;
        long tmp = Math.round(value);
        return (double) tmp / factor;
    }
}
