package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer accountId;
    private String username;
    private String email;
    private String fullName;
    private BigDecimal balance;
    private Integer accountStatusId;
    private String roleName;
    private LocalDateTime createdAt;
}
