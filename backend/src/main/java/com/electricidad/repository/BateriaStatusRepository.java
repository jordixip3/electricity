package com.electricidad.repository;

import com.electricidad.model.BateriaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BateriaStatusRepository extends JpaRepository<BateriaStatus, Long> {
    // Latest N status entries ordered by timestamp descending
    List<BateriaStatus> findTop5ByOrderByTimestampDesc();
    List<BateriaStatus> findTop100ByOrderByTimestampDesc();
    List<BateriaStatus> findAllByOrderByTimestampDesc();
    List<BateriaStatus> findByTimestampAfterOrderByTimestampAsc(java.time.Instant timestamp);
    List<BateriaStatus> findByBateriaIdAndTimestampAfterOrderByTimestampAsc(Long bateriaId, java.time.Instant timestamp);
}
