package com.medstore.repository;

import com.medstore.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("select coalesce(sum(s.total), 0) from Sale s where s.saleTime >= :from and s.saleTime < :to")
    BigDecimal totalInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select count(s) from Sale s where s.saleTime >= :from and s.saleTime < :to")
    long countInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
