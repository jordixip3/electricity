package com.electricidad.repository;

import com.electricidad.model.Lectura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LecturaRepository extends JpaRepository<Lectura, Long> {
    List<Lectura> findByMedidorIdOrderByFechaLecturaDesc(Long medidorId);
    List<Lectura> findByMedidorIdOrderByFechaLecturaAsc(Long medidorId);
}
