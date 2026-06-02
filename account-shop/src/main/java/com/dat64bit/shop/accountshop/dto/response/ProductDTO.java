package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;

@Data
public class ProductDTO {
    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String productName;
    private String description;
    private String imageUrl;
    private Boolean isContactSeller;
    private Boolean isInputEmailRequired;
    private Integer productStatusId;
    private Boolean categoryActive;
    private java.math.BigDecimal startingPrice;
}
