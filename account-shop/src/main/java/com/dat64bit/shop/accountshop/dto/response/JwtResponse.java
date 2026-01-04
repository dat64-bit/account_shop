package com.dat64bit.shop.accountshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class JwtResponse {
    private String token;
    private String type;
    private String message;
    private String username;
    private String role;
}
