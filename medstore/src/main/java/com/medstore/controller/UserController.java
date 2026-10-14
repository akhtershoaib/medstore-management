package com.medstore.controller;

import com.medstore.dto.Dtos.CreateUserRequest;
import com.medstore.entity.AppUser;
import com.medstore.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody CreateUserRequest r) {
        if (users.existsByUsername(r.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        AppUser u = new AppUser();
        u.setUsername(r.username());
        u.setPassword(encoder.encode(r.password()));
        u.setFullName(r.fullName());
        u.setRole(r.role());
        users.save(u);
        return Map.of("id", u.getId(), "username", u.getUsername(), "role", u.getRole());
    }
}
