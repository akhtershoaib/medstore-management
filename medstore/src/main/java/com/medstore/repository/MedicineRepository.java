package com.medstore.repository;

import com.medstore.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByActiveTrue();
    List<Medicine> findByActiveTrueAndNameContainingIgnoreCase(String name);

    @Query("select m from Medicine m where m.active = true and " +
           "(select coalesce(sum(b.quantity), 0) from Batch b " +
           "where b.medicine = m and b.expiryDate >= :today) < m.reorderLevel")
    List<Medicine> findLowStock(@Param("today") LocalDate today);
}
