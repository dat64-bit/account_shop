package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/transactions")
public class TransactionController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AdminService adminService; // We reuse getTransactionsPaged

    @GetMapping("/my-transactions")
    public ResponseEntity<?> getMyTransactions(
            @RequestParam(required = false) Integer lastId,
            @RequestParam(defaultValue = "15") int limit,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String keyword) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            return ResponseEntity.ok(adminService.getTransactionsPaged(statusId, account.getAccountId(), keyword, lastId, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
