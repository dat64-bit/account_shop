package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountId = :accountId")
    Optional<Account> findByIdWithPessimisticLock(@Param("accountId") Integer accountId);
    
    Optional<Account> findByUsername(String username);

    @Query("SELECT a.accountId FROM Account a WHERE " +
           "(:statusId IS NULL OR a.accountStatusId = :statusId) AND " +
           "(:roleId IS NULL OR a.roleId = :roleId) AND " +
           "(:keyword IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR a.accountId < :lastId) " +
           "ORDER BY a.accountId DESC")
    List<Integer> findIdsPaged(
            @Param("statusId") Integer statusId,
            @Param("roleId") Integer roleId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT a FROM Account a WHERE a.accountId IN :ids ORDER BY a.accountId DESC")
    List<Account> findByAccountIdInOrderByAccountIdDesc(@Param("ids") List<Integer> ids);
}
