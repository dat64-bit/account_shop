package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {

}
