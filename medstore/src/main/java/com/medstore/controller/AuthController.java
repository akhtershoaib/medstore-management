package com.medstore.controller;

import com.medstore.dto.Dtos.LoginRequest;
import com.medstore.dto.Dtos.LoginResponse;
import com.medstore.entity.AppUser;
import com.medstore.repository.UserRepository;
import com.medstore.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authManager;
    private final UserRepository users;
    private final JwtUtil jwt;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        AppUser u = users.findByUsername(req.username()).orElseThrow();
        return new LoginResponse(jwt.generate(u.getUsername(), u.getRole().name()),
                u.getUsername(), u.getRole().name());
    }
}
