package com.dat64bit.shop.accountshop;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class test {
    public static void main(String[] args) {
        String sepayToken = "whsec_ZUU8nPVIWTv5fwfqHtsNzfVoqhVP42iw";
        String timestamp = "1780811888";
        String rawBody = "{\"gateway\": \"MBBank\",\"transactionDate\": \"2026-06-07 12:18:00\",\"accountNumber\": \"0963319827\",\"subAccount\": null,\"code\": null,\"content\": \"NAP 9\",\"transferType\": \"in\",\"description\": \"BankAPINotify NAP 9\",\"transferAmount\": 10000,\"referenceCode\": \"FT26159304029311\", \"accumulated\": 0,\"id\": 62225952}";
        String payload = timestamp + "." + rawBody;
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sepayToken.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hashBytes = sha256_HMAC.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }

            String expectedSignature = "sha256=" + hexString.toString();
            System.out.println(expectedSignature);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
