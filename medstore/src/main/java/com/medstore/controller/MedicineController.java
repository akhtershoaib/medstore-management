package com.medstore.controller;

import com.medstore.dto.Dtos.*;
import com.medstore.entity.Batch;
import com.medstore.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {
    private final MedicineService service;

    @GetMapping
    public List<MedicineResponse> search(@RequestParam(required = false) String search) {
        return service.search(search);
    }

    @GetMapping("/{id}")
    public MedicineResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicineResponse create(@Valid @RequestBody MedicineRequest r) {
        return service.create(r);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MedicineResponse update(@PathVariable Long id, @Valid @RequestBody MedicineRequest r) {
        return service.update(id, r);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/batches")
    public List<Batch> batches(@PathVariable Long id) {
        return service.listBatches(id);
    }

    /** Stock in: add a new batch when goods arrive. */
    @PostMapping("/{id}/batches")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public Batch addBatch(@PathVariable Long id, @Valid @RequestBody BatchRequest r) {
        return service.addBatch(id, r);
    }
}
