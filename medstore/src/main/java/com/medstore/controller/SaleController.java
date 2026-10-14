package com.medstore.controller;

import com.medstore.dto.Dtos.SaleRequest;
import com.medstore.entity.Sale;
import com.medstore.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {
    private final BillingService billing;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale create(@Valid @RequestBody SaleRequest req, Authentication auth) {
        return billing.createSale(req, auth.getName());
    }

    @GetMapping("/{id}")
    public Sale get(@PathVariable Long id) {
        return billing.get(id);
    }
}
