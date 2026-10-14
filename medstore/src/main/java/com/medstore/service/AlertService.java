package com.medstore.service;

import com.medstore.dto.Dtos.BatchAlert;
import com.medstore.dto.Dtos.LowStockAlert;
import com.medstore.entity.Batch;
import com.medstore.repository.BatchRepository;
import com.medstore.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertService {
    private final MedicineRepository medicines;
    private final BatchRepository batches;

    public List<LowStockAlert> lowStock() {
        LocalDate today = LocalDate.now();
        return medicines.findLowStock(today).stream()
                .map(m -> new LowStockAlert(m.getId(), m.getName(),
                        batches.sellableStock(m.getId(), today), m.getReorderLevel()))
                .toList();
    }

    public List<BatchAlert> expiringSoon(int days) {
        LocalDate today = LocalDate.now();
        return batches.findByQuantityGreaterThanAndExpiryDateBetweenOrderByExpiryDateAsc(
                0, today, today.plusDays(days)).stream().map(this::toAlert).toList();
    }

    public List<BatchAlert> expired() {
        return batches.findByQuantityGreaterThanAndExpiryDateBefore(0, LocalDate.now())
                .stream().map(this::toAlert).toList();
    }

    private BatchAlert toAlert(Batch b) {
        return new BatchAlert(b.getId(), b.getMedicine().getName(), b.getBatchNo(),
                b.getExpiryDate(), b.getQuantity());
    }
}
