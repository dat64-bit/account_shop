package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.SepayWebhookRequest;
import com.dat64bit.shop.accountshop.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/webhook")
public class WebhookController {

    @Value("${SEPAY_WEBHOOK_TOKEN:}")
    private String sepayToken;

    @Autowired
    private WebhookService webhookService;

    @PostMapping("/sepay")
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody SepayWebhookRequest request) {

        // Validate Token
        if (authorization == null || !authorization.contains(sepayToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }

        try {
            webhookService.processSepayWebhook(request);
            return ResponseEntity.ok().body("{\"success\": true}");
        } catch (Exception e) {
            e.printStackTrace();
            // Return 200 even on error so Sepay doesn't retry infinitely, or 400 depending on preference.
            // Usually we return 200 OK.
            return ResponseEntity.ok().body("{\"success\": false, \"message\": \"Internal error\"}");
        }
    }
}
