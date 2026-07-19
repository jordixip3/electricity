package com.electricidad.repository;

import com.electricidad.model.Medidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedidorRepository extends JpaRepository<Medidor, Long> {
    List<Medidor> findByClienteId(Long clienteId);
    Optional<Medidor> findByNumeroSerie(String numeroSerie);
}
