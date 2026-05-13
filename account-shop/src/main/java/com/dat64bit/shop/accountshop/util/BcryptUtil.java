package com.dat64bit.shop.accountshop.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Chạy main() này để lấy BCrypt hash của password, rồi update vào DB.
 * Đây là class tạm thời chỉ dùng để debug.
 */
public class BcryptUtil {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "password123";
        String hash = encoder.encode(rawPassword);
        System.out.println("Hash for '" + rawPassword + "': " + hash);

        // Verify lại
        boolean matches = encoder.matches(rawPassword, hash);
        System.out.println("Verify matches: " + matches);
    }
}
