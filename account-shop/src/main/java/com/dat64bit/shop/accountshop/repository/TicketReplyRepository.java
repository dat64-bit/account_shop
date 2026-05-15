package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.TicketReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketReplyRepository extends JpaRepository<TicketReply, Integer> {
    List<TicketReply> findByTicketIdOrderByCreatedAtAsc(Integer ticketId);
}
