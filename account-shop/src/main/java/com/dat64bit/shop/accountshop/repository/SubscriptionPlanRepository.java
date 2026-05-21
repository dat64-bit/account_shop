package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {

    @Query("SELECT sp.planId FROM SubscriptionPlan sp WHERE " +
           "(:keyword IS NULL OR LOWER(sp.planName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR sp.planId < :lastId) " +
           "ORDER BY sp.planId DESC")
    List<Integer> findIdsPaged(
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT sp FROM SubscriptionPlan sp WHERE sp.planId IN :ids ORDER BY sp.planId DESC")
    List<SubscriptionPlan> findByPlanIdInOrderByPlanIdDesc(@Param("ids") List<Integer> ids);
}
