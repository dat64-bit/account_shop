package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.request.SepayWebhookRequest;
import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.entity.Transaction;
import com.dat64bit.shop.accountshop.entity.TransactionStatus;
import com.dat64bit.shop.accountshop.entity.TransactionType;
import com.dat64bit.shop.accountshop.entity.PaymentMethod;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.repository.TransactionRepository;
import com.dat64bit.shop.accountshop.repository.TransactionStatusRepository;
import com.dat64bit.shop.accountshop.repository.TransactionTypeRepository;
import com.dat64bit.shop.accountshop.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WebhookService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionTypeRepository transactionTypeRepository;

    @Autowired
    private TransactionStatusRepository transactionStatusRepository;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Transactional
    public void processSepayWebhook(SepayWebhookRequest request) {
        // Validate transfer type (must be incoming/in)
        String type = request.getTransferType();
        if (type != null && !type.equalsIgnoreCase("in")) {
            return; // Not an incoming transfer
        }

        BigDecimal amount = request.getTransferAmount() != null ? request.getTransferAmount() : request.getAmountIn();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String content = request.getContent() != null ? request.getContent() : request.getTransactionContent();
        if (content == null) {
            return;
        }

        String refCode = request.getReferenceCode() != null ? request.getReferenceCode() : request.getReferenceNumber();
        if (refCode == null || refCode.trim().isEmpty()) {
            // fallback to code
            refCode = request.getCode();
        }

        // To prevent duplicate processing, check if a transaction with this sepay reference already exists.
        // We will store the refCode in the description like: "SEPAY_REF: [refCode]"
        String descriptionRef = "SEPAY_REF: " + refCode;
        if (transactionRepository.existsByDescription(descriptionRef)) {
            // Already processed
            return;
        }

        // Parse content to find account ID (e.g. NAP 123)
        Pattern pattern = Pattern.compile("NAP\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);

        if (!matcher.find()) {
            // Invalid syntax
            return;
        }

        Integer accountId;
        try {
            accountId = Integer.parseInt(matcher.group(1));
        } catch (NumberFormatException e) {
            return;
        }

        Optional<Account> accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            return; // Account not found
        }

        Account account = accountOpt.get();

        // Update balance
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // Create Transaction history
        Transaction transaction = new Transaction();
        transaction.setAccountId(account.getAccountId());
        transaction.setAmount(amount);
        transaction.setDescription(descriptionRef);
        transaction.setCreatedAt(LocalDateTime.now());
        
        // Find DEPOSIT type
        Optional<TransactionType> typeOpt = transactionTypeRepository.findByTypeName("DEPOSIT");
        if (typeOpt.isPresent()) {
            transaction.setTransactionTypeId(typeOpt.get().getTransactionTypeId());
        } else {
            transaction.setTransactionTypeId(1); // fallback
        }

        // Find Success status
        Optional<TransactionStatus> statusOpt = transactionStatusRepository.findByStatusName("Success");
        if (statusOpt.isPresent()) {
            transaction.setTransactionStatusId(statusOpt.get().getTransactionStatusId());
        } else {
            transaction.setTransactionStatusId(2); // fallback
        }

        // Find BANKING method
        Optional<PaymentMethod> pmOpt = paymentMethodRepository.findByMethodName("BANKING");
        if (pmOpt.isPresent()) {
            transaction.setPaymentMethodId(pmOpt.get().getPaymentMethodId());
        } else {
            transaction.setPaymentMethodId(3); // fallback
        }

        transactionRepository.save(transaction);
    }
}
