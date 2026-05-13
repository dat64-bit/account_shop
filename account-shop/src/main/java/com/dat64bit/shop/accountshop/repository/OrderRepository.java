package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

}
