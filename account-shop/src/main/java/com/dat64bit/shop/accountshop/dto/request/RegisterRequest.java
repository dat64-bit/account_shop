package com.dat64bit.shop.accountshop.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phoneNumber;
}
