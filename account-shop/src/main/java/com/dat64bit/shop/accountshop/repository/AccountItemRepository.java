package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.AccountItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

@Repository
public interface AccountItemRepository extends JpaRepository<AccountItem, Integer> {
    List<AccountItem> findByProductId(Integer productId);
    List<AccountItem> findByProductIdAndItemStatusId(Integer productId, Integer itemStatusId);

    @Query("SELECT ai.accountItemId FROM AccountItem ai WHERE " +
           "(:productId IS NULL OR ai.productId = :productId) AND " +
           "(:itemStatusId IS NULL OR ai.itemStatusId = :itemStatusId) AND " +
           "(:keyword IS NULL OR LOWER(ai.accountEmail) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR ai.accountItemId < :lastId) " +
           "ORDER BY ai.accountItemId DESC")
    List<Integer> findIdsPaged(
            @Param("productId") Integer productId,
            @Param("itemStatusId") Integer itemStatusId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT ai FROM AccountItem ai WHERE ai.accountItemId IN :ids ORDER BY ai.accountItemId DESC")
    List<AccountItem> findByAccountItemIdInOrderByAccountItemIdDesc(@Param("ids") List<Integer> ids);
}
