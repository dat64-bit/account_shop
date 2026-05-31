package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByAccountIdOrderByCreatedAtDesc(Integer accountId);

    @Query("SELECT DISTINCT o.orderId FROM Order o " +
           "LEFT JOIN OrderDetail od ON od.orderId = o.orderId " +
           "LEFT JOIN ProductSubscription ps ON ps.productSubscriptionId = od.productSubscriptionId " +
           "LEFT JOIN Product p ON p.productId = ps.productId " +
           "LEFT JOIN Account a ON a.accountId = o.accountId " +
           "WHERE (:accountId IS NULL OR o.accountId = :accountId) AND " +
           "(:statusId IS NULL OR o.orderStatusId = :statusId) AND " +
           "(:keyword IS NULL OR CAST(o.orderId AS string) LIKE CONCAT('%', :keyword, '%') OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(o.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR o.orderId < :lastId) " +
           "ORDER BY o.orderId DESC")
    List<Integer> findIdsPaged(
            @Param("statusId") Integer statusId,
            @Param("accountId") Integer accountId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE o.orderId IN :ids ORDER BY o.orderId DESC")
    List<Order> findByOrderIdInOrderByOrderIdDesc(@Param("ids") List<Integer> ids);
}
