package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p.productId FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.categoryId = :categoryId) AND " +
           "(:statusId IS NULL OR p.productStatusId = :statusId) AND " +
           "(:keyword IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR p.productId < :lastId) " +
           "ORDER BY p.productId DESC")
    List<Integer> findIdsPaged(
            @Param("categoryId") Integer categoryId,
            @Param("statusId") Integer statusId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.productId IN :ids ORDER BY p.productId DESC")
    List<Product> findByProductIdInOrderByProductIdDesc(@Param("ids") List<Integer> ids);
}
