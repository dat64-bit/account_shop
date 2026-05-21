package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.ProductSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ProductSubscriptionRepository extends JpaRepository<ProductSubscription, Integer> {

    @Query("SELECT ps.productSubscriptionId FROM ProductSubscription ps WHERE " +
           "(:productId IS NULL OR ps.productId = :productId) AND " +
           "(:lastId IS NULL OR ps.productSubscriptionId < :lastId) " +
           "ORDER BY ps.productSubscriptionId DESC")
    List<Integer> findIdsPaged(
            @Param("productId") Integer productId,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT ps FROM ProductSubscription ps WHERE ps.productSubscriptionId IN :ids ORDER BY ps.productSubscriptionId DESC")
    List<ProductSubscription> findByProductSubscriptionIdInOrderByProductSubscriptionIdDesc(@Param("ids") List<Integer> ids);
}
