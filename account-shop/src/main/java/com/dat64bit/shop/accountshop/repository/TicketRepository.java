package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByAccountIdOrderByCreatedAtDesc(Integer accountId);

    @Query("SELECT DISTINCT t.ticketId FROM Ticket t " +
           "LEFT JOIN Account a ON a.accountId = t.accountId " +
           "WHERE (:accountId IS NULL OR t.accountId = :accountId) AND " +
           "(:statusId IS NULL OR t.ticketStatusId = :statusId) AND " +
           "(:keyword IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.issueType) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:lastId IS NULL OR t.ticketId < :lastId) " +
           "ORDER BY t.ticketId DESC")
    List<Integer> findIdsPaged(
            @Param("statusId") Integer statusId,
            @Param("accountId") Integer accountId,
            @Param("keyword") String keyword,
            @Param("lastId") Integer lastId,
            Pageable pageable
    );

    @Query("SELECT t FROM Ticket t WHERE t.ticketId IN :ids ORDER BY t.ticketId DESC")
    List<Ticket> findByTicketIdInOrderByTicketIdDesc(@Param("ids") List<Integer> ids);
}
