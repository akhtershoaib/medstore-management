package com.medstore.dto;

import com.medstore.entity.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record LoginResponse(String token, String username, String role) {}

    public record CreateUserRequest(@NotBlank String username,
                                    @NotBlank @Size(min = 6) String password,
                                    @NotBlank String fullName,
                                    @NotNull Role role) {}

    public record MedicineRequest(@NotBlank String name,
                                  String category,
                                  String manufacturer,
                                  @NotNull @DecimalMin("0.01") BigDecimal mrp,
                                  @NotNull @DecimalMin("0") BigDecimal gstPercent,
                                  @Min(0) int reorderLevel) {}

    public record MedicineResponse(Long id, String name, String category, String manufacturer,
                                   BigDecimal mrp, BigDecimal gstPercent, int reorderLevel, long stock) {}

    public record BatchRequest(@NotBlank String batchNo,
                               @NotNull @Future LocalDate expiryDate,
                               @Min(1) int quantity,
                               @NotNull @DecimalMin("0.01") BigDecimal purchasePrice) {}

    public record SaleItemRequest(@NotNull Long medicineId, @Min(1) int quantity) {}

    public record SaleRequest(String customerName,
                              @DecimalMin("0") BigDecimal discount,
                              @NotEmpty List<@Valid SaleItemRequest> items) {}

    public record BatchAlert(Long batchId, String medicine, String batchNo,
                             LocalDate expiryDate, int quantity) {}

    public record LowStockAlert(Long medicineId, String medicine, long stock, int reorderLevel) {}
}
