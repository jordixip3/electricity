package com.electricidad.repository;

import com.electricidad.model.Lectura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LecturaRepository extends JpaRepository<Lectura, Long> {
    List<Lectura> findByMedidorIdOrderByFechaLecturaDesc(Long medidorId);
    List<Lectura> findByMedidorIdOrderByFechaLecturaAsc(Long medidorId);

    // Analytics: lecturas por rango de fechas (todos los contadores)
    @Query("SELECT l FROM Lectura l WHERE l.fechaLectura BETWEEN :from AND :to ORDER BY l.fechaLectura ASC")
    List<Lectura> findByFechaRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Analytics: lecturas por rango de fechas filtradas por PLC
    @Query("SELECT l FROM Lectura l JOIN l.medidor m WHERE m.plc.id = :plcId AND l.fechaLectura BETWEEN :from AND :to ORDER BY l.fechaLectura ASC")
    List<Lectura> findByPlcAndFechaRange(@Param("plcId") Long plcId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    // Analytics: lecturas de un medidor específico por rango
    @Query("SELECT l FROM Lectura l WHERE l.medidor.id = :medidorId AND l.fechaLectura BETWEEN :from AND :to ORDER BY l.fechaLectura ASC")
    List<Lectura> findByMedidorAndFechaRange(@Param("medidorId") Long medidorId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}

