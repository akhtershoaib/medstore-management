package com.medstore.repository;

import com.medstore.entity.Batch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    /** Non-expired batches with stock, earliest expiry first (FEFO), row-locked for the sale. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Batch b where b.medicine.id = :mid and b.quantity > 0 " +
           "and b.expiryDate >= :today order by b.expiryDate asc")
    List<Batch> findSellableForUpdate(@Param("mid") Long medicineId, @Param("today") LocalDate today);

    @Query("select coalesce(sum(b.quantity), 0) from Batch b " +
           "where b.medicine.id = :mid and b.expiryDate >= :today")
    long sellableStock(@Param("mid") Long medicineId, @Param("today") LocalDate today);

    List<Batch> findByMedicineIdOrderByExpiryDateAsc(Long medicineId);

    List<Batch> findByQuantityGreaterThanAndExpiryDateBetweenOrderByExpiryDateAsc(
            int quantity, LocalDate from, LocalDate to);

    List<Batch> findByQuantityGreaterThanAndExpiryDateBefore(int quantity, LocalDate date);
}
