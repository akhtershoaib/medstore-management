package com.medstore.service;

import com.medstore.dto.Dtos.SaleItemRequest;
import com.medstore.dto.Dtos.SaleRequest;
import com.medstore.entity.Batch;
import com.medstore.entity.Medicine;
import com.medstore.entity.Sale;
import com.medstore.entity.SaleItem;
import com.medstore.exception.InsufficientStockException;
import com.medstore.exception.ResourceNotFoundException;
import com.medstore.repository.BatchRepository;
import com.medstore.repository.MedicineRepository;
import com.medstore.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BillingService {
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final DateTimeFormatter INVOICE_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final MedicineRepository medicines;
    private final BatchRepository batches;
    private final SaleRepository sales;

    /**
     * One transaction: if any item lacks stock, nothing is saved and no stock is deducted.
     * MRP is treated as GST-inclusive (standard in Indian pharmacies).
     */
    @Transactional
    public Sale createSale(SaleRequest req, String username) {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Sale sale = new Sale();
        sale.setInvoiceNo("INV-" + INVOICE_FMT.format(now));
        sale.setSaleTime(now);
        sale.setCustomerName(req.customerName());
        sale.setCreatedBy(username);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstTotal = BigDecimal.ZERO;

        for (SaleItemRequest item : req.items()) {
            Medicine m = medicines.findById(item.medicineId()).filter(Medicine::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + item.medicineId()));

            int remaining = item.quantity();
            for (Batch b : batches.findSellableForUpdate(m.getId(), today)) {
                if (remaining == 0) break;
                int take = Math.min(remaining, b.getQuantity());
                b.setQuantity(b.getQuantity() - take);
                remaining -= take;

                BigDecimal line = m.getMrp().multiply(BigDecimal.valueOf(take)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal lineGst = line.multiply(m.getGstPercent())
                        .divide(m.getGstPercent().add(HUNDRED), 2, RoundingMode.HALF_UP);

                SaleItem si = new SaleItem();
                si.setMedicineId(m.getId());
                si.setMedicineName(m.getName());
                si.setBatchNo(b.getBatchNo());
                si.setQuantity(take);
                si.setUnitPrice(m.getMrp());
                si.setGstPercent(m.getGstPercent());
                si.setLineTotal(line);
                sale.addItem(si);

                subtotal = subtotal.add(line);
                gstTotal = gstTotal.add(lineGst);
            }
            if (remaining > 0) {
                throw new InsufficientStockException("Not enough stock for " + m.getName()
                        + " (short by " + remaining + ")");
            }
        }

        BigDecimal discount = req.discount() == null ? BigDecimal.ZERO : req.discount();
        if (discount.compareTo(subtotal) > 0) {
            throw new IllegalArgumentException("Discount cannot exceed the bill amount");
        }

        sale.setSubtotal(subtotal);
        sale.setGstAmount(gstTotal);
        sale.setDiscount(discount);
        sale.setTotal(subtotal.subtract(discount));
        return sales.save(sale);
    }

    @Transactional(readOnly = true)
    public Sale get(Long id) {
        return sales.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sale not found: " + id));
    }
}
