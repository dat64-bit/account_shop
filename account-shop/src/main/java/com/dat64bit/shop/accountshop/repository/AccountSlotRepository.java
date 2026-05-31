package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.AccountSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSlotRepository extends JpaRepository<AccountSlot, Integer> {

    @Query(value = "SELECT s.* FROM account_slot s " +
                   "JOIN account_item i ON s.account_item_id = i.account_item_id " +
                   "WHERE i.product_id = :productId AND i.item_status_id = 1 AND s.slot_status_id = 1", 
           nativeQuery = true)
    List<AccountSlot> findAvailableSlotsByProductId(@Param("productId") Integer productId);

    @Query(value = "SELECT s.* FROM account_slot s " +
                   "JOIN account_item i ON s.account_item_id = i.account_item_id " +
                   "WHERE i.product_id = :productId AND i.item_status_id = 1", 
           nativeQuery = true)
    List<AccountSlot> findAllSlotsByProductId(@Param("productId") Integer productId);

    List<AccountSlot> findByAccountItemIdIn(List<Integer> accountItemIds);
}
