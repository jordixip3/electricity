package com.electricidad.repository;

import com.electricidad.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByMedidorId(Long medidorId);
    List<Incidencia> findByMedidorClienteId(Long clienteId);
}
