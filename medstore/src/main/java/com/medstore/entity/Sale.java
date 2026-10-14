package com.medstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor
public class Sale {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNo;

    private LocalDateTime saleTime;
    private String customerName;
    private String createdBy;

    @Column(precision = 12, scale = 2) 
    private BigDecimal subtotal;
    @Column(precision = 12, scale = 2) 
    private BigDecimal gstAmount;
    @Column(precision = 12, scale = 2) 
    private BigDecimal discount;
    @Column(precision = 12, scale = 2) 
    private BigDecimal total;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<SaleItem> items = new ArrayList<>();

    public void addItem(SaleItem item) {
        item.setSale(this);
        items.add(item);
    }
}
