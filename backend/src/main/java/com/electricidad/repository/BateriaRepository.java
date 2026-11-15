package com.electricidad.repository;

import com.electricidad.model.Bateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BateriaRepository extends JpaRepository<Bateria, Long> {
    List<Bateria> findByPuntoConexionId(Long puntoConexionId);
    Optional<Bateria> findByNombre(String nombre);
}
