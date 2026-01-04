package com.dat64bit.shop.accountshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginResponse {
    private String token; // Giả lập token
    private String message;
}
