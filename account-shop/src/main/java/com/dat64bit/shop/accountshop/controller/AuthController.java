package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.LoginRequest;
import com.dat64bit.shop.accountshop.dto.request.RegisterRequest;
import com.dat64bit.shop.accountshop.dto.response.AuthResponse;
import com.dat64bit.shop.accountshop.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
       try {
           AuthResponse authResponse = authService.login(request);
           
           // Thiết lập HttpOnly Cookie chứa token
           Cookie cookie = new Cookie("token", authResponse.getToken());
           cookie.setHttpOnly(true);
           cookie.setSecure(false); // Đặt true nếu chạy HTTPS (Production), chạy HTTP local để false
           cookie.setPath("/");
           cookie.setMaxAge(7 * 24 * 60 * 60); // 7 ngày
           response.addCookie(cookie);
           
           return ResponseEntity.ok(authResponse);
       } catch (RuntimeException e) {
           return ResponseEntity.badRequest().body(e.getMessage());
       }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.register(request);
            
            // Thiết lập HttpOnly Cookie chứa token
            Cookie cookie = new Cookie("token", authResponse.getToken());
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(cookie);

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication, HttpServletResponse response) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        
        // Xóa Cookie bằng cách đặt MaxAge = 0
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return ResponseEntity.ok("Đăng xuất thành công");
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}