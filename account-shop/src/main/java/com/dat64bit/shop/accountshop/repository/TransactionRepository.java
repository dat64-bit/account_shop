package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @Query("SELECT t.transactionId FROM Transaction t " +
           "LEFT JOIN Account a ON a.accountId = t.accountId " +
           "WHERE (:accountId IS NULL OR t.accountId = :accountId) AND " +
           "(:statusId IS NULL OR t.transactionStatusId = :statusId) AND " +
           "(:keyword IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR t.transactionId < :lastId) " +
           "ORDER BY t.transactionId DESC")
    List<Integer> findIdsPaged(
            @Param("statusId") Integer statusId,
            @Param("accountId") Integer accountId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE t.transactionId IN :ids ORDER BY t.transactionId DESC")
    List<Transaction> findByTransactionIdInOrderByTransactionIdDesc(@Param("ids") List<Integer> ids);
}
