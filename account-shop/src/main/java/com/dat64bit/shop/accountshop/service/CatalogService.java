package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.response.CategoryDTO;
import com.dat64bit.shop.accountshop.dto.response.ProductDTO;
import com.dat64bit.shop.accountshop.dto.response.ProductSubscriptionDTO;
import com.dat64bit.shop.accountshop.entity.Category;
import com.dat64bit.shop.accountshop.entity.Product;
import com.dat64bit.shop.accountshop.entity.ProductSubscription;
import com.dat64bit.shop.accountshop.repository.CategoryRepository;
import com.dat64bit.shop.accountshop.repository.ProductRepository;
import com.dat64bit.shop.accountshop.repository.ProductSubscriptionRepository;
import com.dat64bit.shop.accountshop.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CatalogService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductSubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    public List<CategoryDTO> getAllActiveCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getProductStatusId() != null && p.getProductStatusId() == 1) // 1 = Active
                .filter(p -> categoryId == null || p.getCategoryId().equals(categoryId))
                .map(this::mapToProductDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToProductDTO(product);
    }

    public List<ProductSubscriptionDTO> getSubscriptionsByProductId(Integer productId) {
        return subscriptionRepository.findAll().stream()
                .filter(s -> s.getProductId().equals(productId))
                .map(this::mapToSubscriptionDTO)
                .collect(Collectors.toList());
    }

    private CategoryDTO mapToCategoryDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        return dto;
    }

    private ProductDTO mapToProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setCategoryId(product.getCategoryId());
        dto.setProductName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsContactSeller(product.getIsContactSeller());
        dto.setIsInputEmailRequired(product.getIsInputEmailRequired());
        dto.setProductStatusId(product.getProductStatusId());

        categoryRepository.findById(product.getCategoryId())
                .ifPresent(c -> dto.setCategoryName(c.getCategoryName()));

        return dto;
    }

    private ProductSubscriptionDTO mapToSubscriptionDTO(ProductSubscription sub) {
        ProductSubscriptionDTO dto = new ProductSubscriptionDTO();
        dto.setProductSubscriptionId(sub.getProductSubscriptionId());
        dto.setProductId(sub.getProductId());
        dto.setPlanId(sub.getPlanId());
        dto.setPrice(sub.getPrice());

        planRepository.findById(sub.getPlanId())
                .ifPresent(p -> dto.setPlanName(p.getPlanName()));

        return dto;
    }
}
