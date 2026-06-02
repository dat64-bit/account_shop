package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionStatusRepository extends JpaRepository<TransactionStatus, Integer> {
    java.util.Optional<TransactionStatus> findByStatusName(String statusName);
}
