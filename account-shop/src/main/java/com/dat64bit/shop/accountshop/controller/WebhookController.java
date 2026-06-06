package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.SepayWebhookRequest;
import com.dat64bit.shop.accountshop.service.WebhookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/public/webhook")
public class WebhookController {

    @Value("${sepay.webhook.token:}")
    private String sepayToken;

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/sepay")
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "X-SePay-Signature", required = false) String signatureHeader,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestamp,
            @RequestBody String rawBody) {

        // Validate Headers
        if (signatureHeader == null || timestamp == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing HMAC signature headers");
        }

        try {
            // Verify HMAC-SHA256 Signature
            String payload = timestamp + "." + rawBody;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sepayToken.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hashBytes = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }

            String expectedSignature = "sha256=" + hexString.toString();

            if (!signatureHeader.equals(expectedSignature)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid HMAC signature");
            }

            // Signature valid, parse JSON and process
            SepayWebhookRequest request = objectMapper.readValue(rawBody, SepayWebhookRequest.class);
            webhookService.processSepayWebhook(request);

            return ResponseEntity.ok().body("{\"success\": true}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok().body("{\"success\": false, \"message\": \"Internal error\"}");
        }
    }
}
