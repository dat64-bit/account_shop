package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/files")
@PreAuthorize("hasRole('ADMIN')")
public class FileController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Xác thực định dạng file (Chỉ cho phép file ảnh)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Chỉ chấp nhận các file định dạng hình ảnh!");
            }

            // Tải ảnh lên Cloudinary
            String fileUrl = cloudinaryService.uploadFile(file);

            // Trả về URL của ảnh dưới dạng JSON
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi tải ảnh lên đám mây: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải file: " + e.getMessage());
        }
    }
}
