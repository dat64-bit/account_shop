package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.InventoryRequest;
import com.dat64bit.shop.accountshop.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        try {
            adminService.updateUserStatus(id, statusId);
            return ResponseEntity.ok("User status updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/products/{id}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        try {
            adminService.toggleProductStatus(id, statusId);
            return ResponseEntity.ok("Product status updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/inventory")
    public ResponseEntity<?> addInventory(@RequestBody InventoryRequest request) {
        try {
            adminService.addInventory(request);
            return ResponseEntity.ok("Inventory added successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/orders/{orderDetailId}/replace-account")
    public ResponseEntity<?> replaceAccount(@PathVariable Integer orderDetailId, @RequestParam Integer newAccountItemId) {
        try {
            adminService.replaceAccountForOrder(orderDetailId, newAccountItemId);
            return ResponseEntity.ok("Account replaced successfully for the order.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/tickets/{id}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable Integer id, @RequestParam Integer newStatusId, @RequestParam(required = false) String notes) {
        try {
            adminService.resolveTicket(id, notes, newStatusId);
            return ResponseEntity.ok("Ticket resolved successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
