package com.medstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter @Setter @NoArgsConstructor
public class SaleItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id")
    @JsonIgnore
    private Sale sale;

    private Long medicineId;
    private String medicineName;
    private String batchNo;
    private int quantity;

    @Column(precision = 10, scale = 2) private BigDecimal unitPrice;
    @Column(precision = 5, scale = 2) private BigDecimal gstPercent;
    @Column(precision = 12, scale = 2) private BigDecimal lineTotal;
}
