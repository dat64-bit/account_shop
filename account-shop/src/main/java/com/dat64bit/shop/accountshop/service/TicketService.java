package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.request.TicketReplyRequest;
import com.dat64bit.shop.accountshop.dto.request.TicketRequest;
import com.dat64bit.shop.accountshop.entity.Ticket;
import com.dat64bit.shop.accountshop.entity.TicketReply;
import com.dat64bit.shop.accountshop.repository.TicketReplyRepository;
import com.dat64bit.shop.accountshop.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketReplyRepository ticketReplyRepository;

    @Transactional
    public Ticket createTicket(Integer accountId, TicketRequest request) {
        Ticket ticket = Ticket.builder()
                .accountId(accountId)
                .orderDetailId(request.getOrderDetailId())
                .issueType(request.getIssueType())
                .ticketStatusId(1) // Giả định 1 là status OPEN
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        ticket = ticketRepository.save(ticket);

        if (request.getMessage() != null && !request.getMessage().isEmpty()) {
            addReply(ticket.getTicketId(), accountId, request.getMessage());
        }

        return ticket;
    }

    public List<Ticket> getTicketsByAccount(Integer accountId) {
        return ticketRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Integer ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<TicketReply> getRepliesByTicket(Integer ticketId) {
        return ticketReplyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Transactional
    public void addReply(Integer ticketId, Integer senderId, String message) {
        Ticket ticket = getTicketById(ticketId);
        
        TicketReply reply = TicketReply.builder()
                .ticketId(ticketId)
                .senderId(senderId)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();
        
        ticketReplyRepository.save(reply);
        
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    @Transactional
    public void updateStatus(Integer ticketId, Integer statusId) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setTicketStatusId(statusId);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }
}
