package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.request.TicketRequest;
import com.dat64bit.shop.accountshop.dto.request.TicketReplyRequest;
import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AccountRepository accountRepository;

    private Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody TicketRequest request) {
        try {
            Account account = getCurrentAccount();
            return ResponseEntity.ok(ticketService.createTicket(account.getAccountId(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<?> getMyTickets(
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit,
            @RequestParam(required = false) Integer statusId) {
        try {
            Account account = getCurrentAccount();
            return ResponseEntity.ok(ticketService.getTicketsPaged(statusId, account.getAccountId(), null, lastId, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<?> getTicketReplies(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ticketService.getRepliesByTicket(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<?> addReply(@PathVariable Integer id, @RequestBody TicketReplyRequest request) {
        try {
            Account account = getCurrentAccount();
            ticketService.addReply(id, account.getAccountId(), request.getMessage());
            return ResponseEntity.ok("Reply added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
