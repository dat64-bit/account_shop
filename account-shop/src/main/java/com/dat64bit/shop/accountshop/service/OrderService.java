package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.request.CheckoutRequest;
import com.dat64bit.shop.accountshop.dto.response.OrderDTO;
import com.dat64bit.shop.accountshop.dto.response.PagedResponse;
import com.dat64bit.shop.accountshop.entity.*;
import com.dat64bit.shop.accountshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private AccountRepository accountRepository;
    @Autowired private ProductSubscriptionRepository subscriptionRepository;
    @Autowired private AccountSlotRepository accountSlotRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderDetailRepository orderDetailRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private AccountItemRepository accountItemRepository;
    @Autowired private OrderStatusRepository orderStatusRepository;

    @jakarta.annotation.PostConstruct
    public void initStatuses() {
        try {
            List<OrderStatus> statuses = orderStatusRepository.findAll();
            boolean hasFailed = statuses.stream().anyMatch(s -> "FAILED".equalsIgnoreCase(s.getStatusName()));
            if (!hasFailed) {
                orderStatusRepository.save(OrderStatus.builder().statusName("FAILED").description("Báo lỗi").build());
            }
            boolean hasReplaced = statuses.stream().anyMatch(s -> "REPLACED".equalsIgnoreCase(s.getStatusName()));
            if (!hasReplaced) {
                orderStatusRepository.save(OrderStatus.builder().statusName("REPLACED").description("Đã đổi tài khoản").build());
            }
        } catch (Exception e) {
            System.err.println("Error initializing statuses: " + e.getMessage());
        }
    }

    @Transactional
    public OrderDTO checkout(String username, CheckoutRequest request) {
        // 1. Get Account & lock it for balance update
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
                
        // Pessimistic Lock
        Account lockedAccount = accountRepository.findByIdWithPessimisticLock(account.getAccountId())
                .orElseThrow(() -> new RuntimeException("Khóa tài khoản thất bại"));

        // 2. Determine price
        ProductSubscription sub = subscriptionRepository.findAll().stream()
                .filter(s -> s.getProductId().equals(request.getProductId()) && s.getPlanId().equals(request.getPlanId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói đăng ký cho sản phẩm này"));
                
        BigDecimal unitPrice = sub.getPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        // 3. Check balance lock
        if (Boolean.TRUE.equals(lockedAccount.getBalanceLocked())) {
            throw new RuntimeException("Số dư tài khoản của bạn đang bị khóa. Vui lòng liên hệ Admin.");
        }

        // 4. Check balance
        if (lockedAccount.getBalance().compareTo(totalAmount) < 0) {
            throw new RuntimeException("Số dư không đủ");
        }

        // 4. Find available slots
        List<AccountSlot> availableSlots = accountSlotRepository.findAvailableSlotsByProductId(request.getProductId());
        if (availableSlots.size() < request.getQuantity()) {
            throw new RuntimeException("Sản phẩm này đã hết hàng");
        }

        // 5. Deduct Balance
        lockedAccount.setBalance(lockedAccount.getBalance().subtract(totalAmount));
        accountRepository.save(lockedAccount);

        // 6. Create Transaction (DEPOSIT, but here it's PAYMENT. Assume Type ID 2 = PAYMENT)
        Transaction transaction = new Transaction();
        transaction.setAccountId(lockedAccount.getAccountId());
        transaction.setAmount(totalAmount.negate()); // Số âm
        transaction.setTransactionTypeId(2); // PAYMENT
        transaction.setTransactionStatusId(2); // SUCCESS
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        // 7. Create Order
        Order order = new Order();
        order.setAccountId(lockedAccount.getAccountId());
        order.setTotalAmount(totalAmount);
        order.setOrderStatusId(2); // COMPLETED
        order.setOrderDate(LocalDateTime.now());
        order.setCreatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // 8. Assign Slots & Create Order Details
        Integer firstOrderDetailId = null;
        for (int i = 0; i < request.getQuantity(); i++) {
            AccountSlot assignedSlot = availableSlots.get(i);
            
            // Mark slot as IN USE
            assignedSlot.setSlotStatusId(2); // 2 = IN USE
            accountSlotRepository.save(assignedSlot);

            OrderDetail detail = new OrderDetail();
            detail.setOrderId(savedOrder.getOrderId());
            detail.setProductSubscriptionId(sub.getProductSubscriptionId());
            detail.setAccountItemId(assignedSlot.getAccountItemId());
            detail.setAccountSlotId(assignedSlot.getAccountSlotId());
            detail.setPrice(unitPrice);
            detail.setFulfillmentStatusId(2); // COMPLETED
            OrderDetail savedDetail = orderDetailRepository.save(detail);
            if (firstOrderDetailId == null) {
                firstOrderDetailId = savedDetail.getOrderDetailId();
            }
        }

        OrderDTO dto = new OrderDTO();
        dto.setOrderId(savedOrder.getOrderId());
        dto.setOrderDetailId(firstOrderDetailId);
        dto.setTotalAmount(savedOrder.getTotalAmount());
        dto.setOrderStatus("COMPLETED");
        dto.setFulfillmentStatus("COMPLETED");
        dto.setCreatedAt(savedOrder.getCreatedAt());
        return dto;
    }

    public List<OrderDTO> getMyOrders(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
                
        return orderRepository.findByAccountIdOrderByCreatedAtDesc(account.getAccountId()).stream()
                .map(o -> {
                    OrderDTO dto = new OrderDTO();
                    dto.setOrderId(o.getOrderId());
                    dto.setTotalAmount(o.getTotalAmount());
                    dto.setOrderStatus(o.getOrderStatusId() != null && o.getOrderStatusId() == 5 ? "REFUNDED" :
                                      (o.getOrderStatusId() != null && o.getOrderStatusId() == 2 ? "COMPLETED" :
                                      (o.getOrderStatusId() != null && o.getOrderStatusId() == 6 ? "FAILED" :
                                      (o.getOrderStatusId() != null && o.getOrderStatusId() == 7 ? "REPLACED" : "PENDING"))));
                    dto.setCreatedAt(o.getCreatedAt());

                    // Lấy chi tiết đơn hàng đầu tiên
                    List<OrderDetail> details = orderDetailRepository.findByOrderId(o.getOrderId());
                    
                    if (!details.isEmpty()) {
                        OrderDetail firstDetail = details.get(0);
                        dto.setOrderDetailId(firstDetail.getOrderDetailId());
                        subscriptionRepository.findById(firstDetail.getProductSubscriptionId()).ifPresent(sub -> {
                            productRepository.findById(sub.getProductId()).ifPresent(p -> dto.setProductName(p.getProductName()));
                        });
                        
                        if (firstDetail.getAccountItemId() != null) {
                            accountItemRepository.findById(firstDetail.getAccountItemId()).ifPresent(item -> {
                                String info = item.getAccountEmail() + " | " + item.getAccountPassword();
                                if (firstDetail.getAccountSlotId() != null) {
                                    accountSlotRepository.findById(firstDetail.getAccountSlotId()).ifPresent(slot -> {
                                        dto.setAccountInfo(info + " | Profile: " + slot.getSlotName() + (slot.getPinCode() != null ? " (PIN: " + slot.getPinCode() + ")" : ""));
                                    });
                                } else {
                                    dto.setAccountInfo(info);
                                }
                            });
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public PagedResponse<OrderDTO> getOrdersPaged(Integer lastId, int limit, Integer statusId, Integer accountId, String keyword) {
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<Integer> ids = orderRepository.findIdsPaged(statusId, accountId, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> idsToFetch = hasMore ? ids.subList(0, limit) : ids;

        List<OrderDTO> content = new ArrayList<>();
        if (!idsToFetch.isEmpty()) {
            List<Order> orders = orderRepository.findByOrderIdInOrderByOrderIdDesc(idsToFetch);
            content = orders.stream().map(o -> {
                OrderDTO dto = new OrderDTO();
                dto.setOrderId(o.getOrderId());
                dto.setTotalAmount(o.getTotalAmount());
                dto.setOrderStatus(o.getOrderStatusId() != null && o.getOrderStatusId() == 5 ? "REFUNDED" :
                                  (o.getOrderStatusId() != null && o.getOrderStatusId() == 2 ? "COMPLETED" :
                                  (o.getOrderStatusId() != null && o.getOrderStatusId() == 6 ? "FAILED" :
                                  (o.getOrderStatusId() != null && o.getOrderStatusId() == 7 ? "REPLACED" : "PENDING"))));
                dto.setCreatedAt(o.getCreatedAt());

                // Set username & full name
                accountRepository.findById(o.getAccountId()).ifPresent(acc -> {
                    dto.setUsername(acc.getUsername());
                    dto.setFullName(acc.getFullName());
                });

                // Lấy chi tiết đơn hàng
                List<OrderDetail> details = orderDetailRepository.findByOrderId(o.getOrderId());
                if (!details.isEmpty()) {
                    OrderDetail firstDetail = details.get(0);
                    dto.setOrderDetailId(firstDetail.getOrderDetailId());
                    subscriptionRepository.findById(firstDetail.getProductSubscriptionId()).ifPresent(sub -> {
                        productRepository.findById(sub.getProductId()).ifPresent(p -> dto.setProductName(p.getProductName()));
                    });
                    
                    if (firstDetail.getAccountItemId() != null) {
                        accountItemRepository.findById(firstDetail.getAccountItemId()).ifPresent(item -> {
                            String info = item.getAccountEmail() + " | " + item.getAccountPassword();
                            if (firstDetail.getAccountSlotId() != null) {
                                accountSlotRepository.findById(firstDetail.getAccountSlotId()).ifPresent(slot -> {
                                    dto.setAccountInfo(info + " | Profile: " + slot.getSlotName() + (slot.getPinCode() != null ? " (PIN: " + slot.getPinCode() + ")" : ""));
                                });
                            } else {
                                dto.setAccountInfo(info);
                            }
                        });
                    }
                }
                return dto;
            }).collect(Collectors.toList());
        }

        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<OrderDTO> getMyOrdersPaged(String username, Integer lastId, int limit, Integer statusId, String keyword) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        return getOrdersPaged(lastId, limit, statusId, account.getAccountId(), keyword);
    }
}
