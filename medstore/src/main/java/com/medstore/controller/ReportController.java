package com.medstore.controller;

import com.medstore.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ReportController {
    private final SaleRepository sales;

    @GetMapping("/daily")
    public Map<String, Object> daily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate d = date == null ? LocalDate.now() : date;
        return summary(d, d.plusDays(1));
    }

    @GetMapping("/monthly")
    public Map<String, Object> monthly(@RequestParam int year, @RequestParam int month) {
        LocalDate first = LocalDate.of(year, month, 1);
        return summary(first, first.plusMonths(1));
    }

    private Map<String, Object> summary(LocalDate from, LocalDate toExclusive) {
        LocalDateTime f = from.atStartOfDay();
        LocalDateTime t = toExclusive.atStartOfDay();
        return Map.of("from", from, "toExclusive", toExclusive,
                "invoices", sales.countInRange(f, t),
                "totalSales", sales.totalInRange(f, t));
    }
}
