package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.service.CatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/catalog")
public class CatalogController {

    @Autowired
    private CatalogService catalogService;

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(catalogService.getAllActiveCategories());
    }

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) Integer categoryId) {
        return ResponseEntity.ok(catalogService.getProductsByCategoryId(categoryId));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductDetails(@PathVariable Integer productId) {
        return ResponseEntity.ok(catalogService.getProductById(productId));
    }

    @GetMapping("/products/{productId}/subscriptions")
    public ResponseEntity<?> getProductSubscriptions(@PathVariable Integer productId) {
        return ResponseEntity.ok(catalogService.getSubscriptionsByProductId(productId));
    }
}
