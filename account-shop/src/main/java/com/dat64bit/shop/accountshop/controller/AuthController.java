package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.LoginRequest;
import com.dat64bit.shop.accountshop.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
       try {
           // goi sang service de su ly logic
           return ResponseEntity.ok(authService.login(request));
       } catch (RuntimeException e) {
           //tra ve loi khi dang nhap nhu: tai khoan bi khoa, ...
           return ResponseEntity.badRequest().body(e.getMessage());
       }
    }
}