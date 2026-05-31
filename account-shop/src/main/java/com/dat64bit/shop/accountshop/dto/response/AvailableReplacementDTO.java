package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;

@Data
public class AvailableReplacementDTO {
    private Integer accountItemId;
    private Integer accountSlotId; // null if full account
    private String accountEmail;
    private String accountPassword;
    private String slotName;       // null if full account
    private String pinCode;        // null if full account
    private Integer statusId;      // slotStatusId or itemStatusId
    private String statusName;     // e.g. Sẵn sàng, Đang sử dụng, Đã bán, Lỗi
}
