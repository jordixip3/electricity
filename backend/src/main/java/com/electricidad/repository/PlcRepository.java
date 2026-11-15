package com.electricidad.repository;

import com.electricidad.model.Plc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlcRepository extends JpaRepository<Plc, Long> {
}
