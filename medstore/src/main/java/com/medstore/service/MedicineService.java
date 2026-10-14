package com.medstore.service;

import com.medstore.dto.Dtos.*;
import com.medstore.entity.Batch;
import com.medstore.entity.Medicine;
import com.medstore.exception.ResourceNotFoundException;
import com.medstore.repository.BatchRepository;
import com.medstore.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {
    private final MedicineRepository medicines;
    private final BatchRepository batches;

    @Transactional(readOnly = true)
    public List<MedicineResponse> search(String query) {
        List<Medicine> list = (query == null || query.isBlank())
                ? medicines.findByActiveTrue()
                : medicines.findByActiveTrueAndNameContainingIgnoreCase(query.trim());
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MedicineResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public MedicineResponse create(MedicineRequest r) {
        Medicine m = new Medicine();
        apply(m, r);
        return toResponse(medicines.save(m));
    }

    @Transactional
    public MedicineResponse update(Long id, MedicineRequest r) {
        Medicine m = find(id);
        apply(m, r);
        return toResponse(m);
    }

    /** Soft delete so old invoices stay valid. */
    @Transactional
    public void delete(Long id) {
        find(id).setActive(false);
    }

    @Transactional
    public Batch addBatch(Long medicineId, BatchRequest r) {
        Batch b = new Batch();
        b.setMedicine(find(medicineId));
        b.setBatchNo(r.batchNo());
        b.setExpiryDate(r.expiryDate());
        b.setQuantity(r.quantity());
        b.setPurchasePrice(r.purchasePrice());
        return batches.save(b);
    }

    @Transactional(readOnly = true)
    public List<Batch> listBatches(Long medicineId) {
        find(medicineId);
        return batches.findByMedicineIdOrderByExpiryDateAsc(medicineId);
    }

    private Medicine find(Long id) {
        return medicines.findById(id).filter(Medicine::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    private void apply(Medicine m, MedicineRequest r) {
        m.setName(r.name());
        m.setCategory(r.category());
        m.setManufacturer(r.manufacturer());
        m.setMrp(r.mrp());
        m.setGstPercent(r.gstPercent());
        m.setReorderLevel(r.reorderLevel());
    }

    private MedicineResponse toResponse(Medicine m) {
        long stock = batches.sellableStock(m.getId(), LocalDate.now());
        return new MedicineResponse(m.getId(), m.getName(), m.getCategory(), m.getManufacturer(),
                m.getMrp(), m.getGstPercent(), m.getReorderLevel(), stock);
    }
}
