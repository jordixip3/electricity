package com.electricidad.controller;

import com.electricidad.model.Cliente;
import com.electricidad.service.ElectricidadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ElectricidadService electricidadService;

    // Constructor injection
    public ClienteController(ElectricidadService electricidadService) {
        this.electricidadService = electricidadService;
    }

    @GetMapping
    public List<Cliente> listClientes() {
        return electricidadService.getTodosClientes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getCliente(@PathVariable Long id) {
        return electricidadService.getClientePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCliente(@RequestBody Cliente cliente) {
        try {
            Cliente nuevoCliente = electricidadService.crearCliente(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
