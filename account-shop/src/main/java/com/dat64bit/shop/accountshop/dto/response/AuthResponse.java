package com.dat64bit.shop.accountshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Integer accountId;
    private String username;
    private String email;
    private String role;
    private java.math.BigDecimal balance;
}
