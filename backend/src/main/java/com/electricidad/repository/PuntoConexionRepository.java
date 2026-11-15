package com.electricidad.repository;

import com.electricidad.model.PuntoConexion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PuntoConexionRepository extends JpaRepository<PuntoConexion, Long> {
    boolean existsByNombre(String nombre);
}
