package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.LoginRequest;
import com.dat64bit.shop.accountshop.dto.request.RegisterRequest;
import com.dat64bit.shop.accountshop.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
       try {
           return ResponseEntity.ok(authService.login(request));
       } catch (RuntimeException e) {
           return ResponseEntity.badRequest().body(e.getMessage());
       }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // Lấy thông tin user hiện tại từ Security Context
        return ResponseEntity.ok("Xin chào: " + authentication.getName());
    }
}