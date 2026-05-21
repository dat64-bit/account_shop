package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.CheckoutRequest;
import com.dat64bit.shop.accountshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            return ResponseEntity.ok(orderService.checkout(username, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String keyword) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            return ResponseEntity.ok(orderService.getMyOrdersPaged(username, lastId, limit, statusId, keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
