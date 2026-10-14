package com.medstore.controller;

import com.medstore.dto.Dtos.BatchAlert;
import com.medstore.dto.Dtos.LowStockAlert;
import com.medstore.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertService alerts;

    @GetMapping("/low-stock")
    public List<LowStockAlert> lowStock() { return alerts.lowStock(); }

    @GetMapping("/expiring")
    public List<BatchAlert> expiring(@RequestParam(defaultValue = "60") int days) {
        return alerts.expiringSoon(days);
    }

    @GetMapping("/expired")
    public List<BatchAlert> expired() { return alerts.expired(); }
}
