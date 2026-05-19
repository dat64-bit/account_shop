package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.entity.*;
import com.dat64bit.shop.accountshop.dto.request.InventoryRequest;
import com.dat64bit.shop.accountshop.dto.response.ProductDTO;
import com.dat64bit.shop.accountshop.service.AdminService;
import com.dat64bit.shop.accountshop.service.TicketService;
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

    @Autowired
    private TicketService ticketService;

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

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            return ResponseEntity.ok(adminService.saveProduct(product));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        try {
            product.setProductId(id);
            return ResponseEntity.ok(adminService.saveProduct(product));
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

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            return ResponseEntity.ok(adminService.saveCategory(category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory(@RequestParam(required = false) Integer productId) {
        return ResponseEntity.ok(adminService.getInventory(productId));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Integer id) {
        try {
            adminService.deleteInventoryItem(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Integer id, @RequestParam Integer statusId) {
        try {
            ticketService.updateStatus(id, statusId);
            return ResponseEntity.ok("Ticket status updated successfully.");
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

    // --- Subscription Plans ---
    @GetMapping("/subscription-plans")
    public ResponseEntity<?> getSubscriptionPlans() {
        return ResponseEntity.ok(adminService.getAllSubscriptionPlans());
    }

    @PostMapping("/subscription-plans")
    public ResponseEntity<?> saveSubscriptionPlan(@RequestBody SubscriptionPlan plan) {
        try {
            return ResponseEntity.ok(adminService.saveSubscriptionPlan(plan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Product Subscriptions (Pricing) ---
    @GetMapping("/product-subscriptions")
    public ResponseEntity<?> getProductSubscriptions() {
        return ResponseEntity.ok(adminService.getAllProductSubscriptions());
    }

    @PostMapping("/product-subscriptions")
    public ResponseEntity<?> saveProductSubscription(@RequestBody ProductSubscription sub) {
        try {
            return ResponseEntity.ok(adminService.saveProductSubscription(sub));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/product-subscriptions/{id}/status")
    public ResponseEntity<?> toggleProductSubscriptionStatus(@PathVariable Integer id, @RequestParam Boolean isActive) {
        try {
            adminService.toggleProductSubscriptionStatus(id, isActive);
            return ResponseEntity.ok("Status updated.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
