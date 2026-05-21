package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.entity.*;
import com.dat64bit.shop.accountshop.dto.request.InventoryRequest;
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

    @Autowired
    private com.dat64bit.shop.accountshop.service.OrderService orderService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getUsersPaged(statusId, roleId, keyword, lastId, limit));
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
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getProductsPaged(categoryId, statusId, keyword, lastId, limit));
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
    public ResponseEntity<?> replaceAccount(@PathVariable Integer orderDetailId,
            @RequestParam Integer newAccountItemId) {
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
    public ResponseEntity<?> getCategories(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getCategoriesPaged(isActive, keyword, lastId, limit));
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer itemStatusId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getInventoryPaged(productId, itemStatusId, keyword, lastId, limit));
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
    public ResponseEntity<?> getAllTickets(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(ticketService.getTicketsPaged(statusId, accountId, keyword, lastId, limit));
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
    public ResponseEntity<?> resolveTicket(@PathVariable Integer id, @RequestParam Integer newStatusId,
            @RequestParam(required = false) String notes) {
        try {
            adminService.resolveTicket(id, notes, newStatusId);
            return ResponseEntity.ok("Ticket resolved successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Subscription Plans ---
    @GetMapping("/subscription-plans")
    public ResponseEntity<?> getSubscriptionPlans(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getSubscriptionPlansPaged(keyword, lastId, limit));
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
    public ResponseEntity<?> getProductSubscriptions(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getProductSubscriptionsPaged(productId, lastId, limit));
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

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(orderService.getOrdersPaged(lastId, limit, statusId, accountId, keyword));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(adminService.getTransactionsPaged(statusId, accountId, keyword, lastId, limit));
    }
}
