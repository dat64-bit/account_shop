package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("SELECT c.categoryId FROM Category c WHERE " +
           "(:isActive IS NULL OR c.isActive = :isActive) AND " +
           "(:keyword IS NULL OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR c.categoryId < :lastId) " +
           "ORDER BY c.categoryId DESC")
    List<Integer> findIdsPaged(
            @Param("isActive") Boolean isActive,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT c FROM Category c WHERE c.categoryId IN :ids ORDER BY c.categoryId DESC")
    List<Category> findByCategoryIdInOrderByCategoryIdDesc(@Param("ids") List<Integer> ids);
}
