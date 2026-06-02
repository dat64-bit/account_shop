package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.response.AdminDashboardDTO;
import com.dat64bit.shop.accountshop.dto.response.AdminInventoryDTO;
import com.dat64bit.shop.accountshop.dto.response.UserDTO;
import com.dat64bit.shop.accountshop.dto.response.ProductDTO;
import com.dat64bit.shop.accountshop.dto.response.PagedResponse;
import com.dat64bit.shop.accountshop.dto.response.TransactionDTO;
import com.dat64bit.shop.accountshop.dto.response.AvailableReplacementDTO;
import com.dat64bit.shop.accountshop.dto.request.InventoryRequest;
import com.dat64bit.shop.accountshop.entity.*;
import com.dat64bit.shop.accountshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderDetailRepository orderDetailRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private AccountItemRepository accountItemRepository;
    @Autowired
    private AccountSlotRepository accountSlotRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;
    @Autowired
    private ProductSubscriptionRepository productSubscriptionRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private TransactionStatusRepository transactionStatusRepository;
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;
    @Autowired
    private TransactionTypeRepository transactionTypeRepository;

    public AdminDashboardDTO getDashboardStats() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        dto.setTotalUsers(accountRepository.count());

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        // Stats Today
        long ordersToday = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfDay))
                .count();
        dto.setTotalOrdersToday(ordersToday);

        // Revenue (Sum of all completed orders)
        BigDecimal totalRevenue = orderDetailRepository.findAll().stream()
                .map(OrderDetail::getPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalRevenue(totalRevenue);

        // Pending tickets
        long pendingTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getTicketStatusId() != null && t.getTicketStatusId() == 1)
                .count();
        dto.setPendingTickets(pendingTickets);

        // --- Chart Data: Last 7 Days ---
        java.util.List<BigDecimal> revenueTrend = new java.util.ArrayList<>();
        java.util.List<Long> orderTrend = new java.util.ArrayList<>();
        List<OrderDetail> allDetails = orderDetailRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = LocalDateTime.of(date, LocalTime.MIN);
            LocalDateTime end = LocalDateTime.of(date, LocalTime.MAX);

            BigDecimal dayRevenue = allDetails.stream()
                    .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(start)
                            && d.getCreatedAt().isBefore(end))
                    .map(OrderDetail::getPrice)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueTrend.add(dayRevenue);

            long dayOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(start)
                            && o.getCreatedAt().isBefore(end))
                    .count();
            orderTrend.add(dayOrders);
        }
        dto.setRevenueTrend(revenueTrend);
        dto.setOrderTrend(orderTrend);

        // --- Top Products ---
        // (Simplified logic: taking top products from the database)
        List<Product> products = productRepository.findAll();
        dto.setTopProductNames(products.stream().limit(6).map(Product::getProductName).collect(Collectors.toList()));
        dto.setTopProductSales(
                products.stream().limit(6).map(p -> (long) (Math.random() * 100)).collect(Collectors.toList()));
        dto.setTopProductPreviousSales(
                products.stream().limit(6).map(p -> (long) (Math.random() * 100)).collect(Collectors.toList()));

        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return accountRepository.findAll().stream().map(acc -> {
            UserDTO dto = new UserDTO();
            dto.setAccountId(acc.getAccountId());
            dto.setUsername(acc.getUsername());
            dto.setEmail(acc.getEmail());
            dto.setFullName(acc.getFullName());
            dto.setBalance(acc.getBalance());
            dto.setAccountStatusId(acc.getAccountStatusId());
            dto.setCreatedAt(acc.getCreatedAt());

            roleRepository.findById(acc.getRoleId()).ifPresent(r -> dto.setRoleName(r.getRoleName()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateUserStatus(Integer accountId, Integer statusId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        acc.setAccountStatusId(statusId);
        accountRepository.save(acc);
    }

    @Transactional
    public Category saveCategory(Category category) {
        if (category.getCategoryId() == null) {
            category.setCreatedAt(LocalDateTime.now());
            if (category.getIsActive() == null)
                category.setIsActive(true);
        }
        category.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Product saveProduct(Product product) {
        if (product.getProductId() == null) {
            product.setCreatedAt(LocalDateTime.now());
            if (product.getProductStatusId() == null)
                product.setProductStatusId(1);
        }
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteInventoryItem(Integer id) {
        accountItemRepository.deleteById(id);
    }

    public List<AdminInventoryDTO> getInventory(Integer productId) {
        List<AccountItem> items;
        if (productId != null) {
            items = accountItemRepository.findByProductId(productId);
        } else {
            items = accountItemRepository.findAll();
        }

        List<Integer> accountItemIds = items.stream().map(AccountItem::getAccountItemId).collect(Collectors.toList());
        List<AccountSlot> allSlots = accountItemIds.isEmpty() ? new java.util.ArrayList<>() 
                : accountSlotRepository.findByAccountItemIdIn(accountItemIds);
        java.util.Map<Integer, List<AccountSlot>> slotsMap = allSlots.stream()
                .collect(Collectors.groupingBy(AccountSlot::getAccountItemId));

        return items.stream().map(item -> {
            AdminInventoryDTO dto = new AdminInventoryDTO();
            dto.setAccountItemId(item.getAccountItemId());
            dto.setProductId(item.getProductId());
            dto.setAccountEmail(item.getAccountEmail());
            dto.setAccountPassword(item.getAccountPassword());
            dto.setItemStatusId(item.getItemStatusId());
            dto.setCreatedAt(item.getCreatedAt());

            productRepository.findById(item.getProductId()).ifPresent(p -> {
                dto.setProductName(p.getProductName());
            });

            dto.setStatusName(
                    item.getItemStatusId() == 1 ? "Sẵn sàng" : item.getItemStatusId() == 2 ? "Đã bán" : "Lỗi");

            List<AccountSlot> slots = slotsMap.get(item.getAccountItemId());
            if (slots != null && !slots.isEmpty()) {
                dto.setTotalSlots(slots.size());
                dto.setSoldSlots((int) slots.stream().filter(s -> s.getSlotStatusId() == 2).count());
                dto.setFreeSlots((int) slots.stream().filter(s -> s.getSlotStatusId() == 1).count());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void toggleProductStatus(Integer productId, Integer statusId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        p.setProductStatusId(statusId);
        productRepository.save(p);
    }

    @Transactional
    public void addInventory(InventoryRequest request) {
        AccountItem item = new AccountItem();
        item.setProductId(request.getProductId());
        item.setAccountEmail(request.getEmailOrUsername());
        item.setAccountPassword(request.getPassword());
        item.setItemStatusId(1); // ACTIVE / AVAILABLE
        item.setCreatedAt(LocalDateTime.now());

        item = accountItemRepository.save(item);

        if (request.getMaxSlots() != null && request.getMaxSlots() > 1) {
            for (int i = 1; i <= request.getMaxSlots(); i++) {
                AccountSlot slot = new AccountSlot();
                slot.setAccountItemId(item.getAccountItemId());
                slot.setSlotName("Profile " + i);
                slot.setPinCode("0000"); // Default PIN
                slot.setSlotStatusId(1); // AVAILABLE
                slot.setCreatedAt(LocalDateTime.now());
                accountSlotRepository.save(slot);
            }
        }
    }

    @Transactional
    public void updateInventory(Integer id, InventoryRequest request) {
        AccountItem item = accountItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản để bán"));
        item.setProductId(request.getProductId());
        item.setAccountEmail(request.getEmailOrUsername());
        item.setAccountPassword(request.getPassword());
        if (request.getItemStatusId() != null) {
            item.setItemStatusId(request.getItemStatusId());
        }
        item.setUpdatedAt(LocalDateTime.now());
        accountItemRepository.save(item);
    }

    @Transactional
    public void replaceAccountForOrder(Integer orderDetailId, Integer newAccountItemId, Integer newAccountSlotId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng"));

        // Thu hồi account/slot cũ (đánh dấu lỗi/expired)
        if (detail.getAccountSlotId() != null) {
            accountSlotRepository.findById(detail.getAccountSlotId()).ifPresent(oldSlot -> {
                oldSlot.setSlotStatusId(3); // 3 = Expired/Faulty
                accountSlotRepository.save(oldSlot);
            });
        } else if (detail.getAccountItemId() != null) {
            accountItemRepository.findById(detail.getAccountItemId()).ifPresent(oldItem -> {
                oldItem.setItemStatusId(3); // 3 = BANNED / FAULTY
                accountItemRepository.save(oldItem);
            });
        }

        // Gán account/slot mới
        detail.setAccountItemId(newAccountItemId);
        detail.setAccountSlotId(newAccountSlotId);
        detail.setUpdatedAt(LocalDateTime.now());
        orderDetailRepository.save(detail);

        // Đánh dấu account/slot mới là Đã bán / In use
        if (newAccountSlotId != null) {
            accountSlotRepository.findById(newAccountSlotId).ifPresent(newSlot -> {
                newSlot.setSlotStatusId(2); // 2 = IN USE
                accountSlotRepository.save(newSlot);
            });
        } else {
            accountItemRepository.findById(newAccountItemId).ifPresent(newItem -> {
                newItem.setItemStatusId(2); // 2 = IN USE
                accountItemRepository.save(newItem);
            });
        }

        // Cập nhật trạng thái đơn hàng thành Đã đổi tài khoản (7)
        orderRepository.findById(detail.getOrderId()).ifPresent(order -> {
            order.setOrderStatusId(7); // 7 = REPLACED
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        });
    }

    public List<AvailableReplacementDTO> getAvailableReplacements(Integer orderDetailId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng"));
        
        ProductSubscription sub = productSubscriptionRepository.findById(detail.getProductSubscriptionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói đăng ký sản phẩm"));
        Integer productId = sub.getProductId();

        List<AvailableReplacementDTO> replacements = new java.util.ArrayList<>();

        if (detail.getAccountSlotId() != null) {
            // Đơn hàng mua theo slot -> cho phép chọn tất cả các slot của sản phẩm
            List<AccountSlot> allSlots = accountSlotRepository.findAllSlotsByProductId(productId);
            for (AccountSlot slot : allSlots) {
                AvailableReplacementDTO dto = new AvailableReplacementDTO();
                dto.setAccountItemId(slot.getAccountItemId());
                dto.setAccountSlotId(slot.getAccountSlotId());
                dto.setSlotName(slot.getSlotName());
                dto.setPinCode(slot.getPinCode());
                dto.setStatusId(slot.getSlotStatusId());
                dto.setStatusName(slot.getSlotStatusId() == 1 ? "Sẵn sàng" : 
                                  slot.getSlotStatusId() == 2 ? "Đang sử dụng" : "Lỗi");
                accountItemRepository.findById(slot.getAccountItemId()).ifPresent(item -> {
                    dto.setAccountEmail(item.getAccountEmail());
                    dto.setAccountPassword(item.getAccountPassword());
                });
                replacements.add(dto);
            }
        } else {
            // Đơn hàng mua cả tài khoản -> cho phép chọn tất cả các tài khoản đang hoạt động (itemStatusId = 1) của sản phẩm
            List<AccountItem> activeItems = accountItemRepository.findByProductIdAndItemStatusId(productId, 1);
            for (AccountItem item : activeItems) {
                List<AccountSlot> slots = accountSlotRepository.findByAccountItemIdIn(java.util.Collections.singletonList(item.getAccountItemId()));
                if (slots.isEmpty()) {
                    AvailableReplacementDTO dto = new AvailableReplacementDTO();
                    dto.setAccountItemId(item.getAccountItemId());
                    dto.setAccountSlotId(null);
                    dto.setAccountEmail(item.getAccountEmail());
                    dto.setAccountPassword(item.getAccountPassword());
                    dto.setSlotName(null);
                    dto.setPinCode(null);
                    dto.setStatusId(item.getItemStatusId());
                    dto.setStatusName(item.getItemStatusId() == 1 ? "Sẵn sàng" : 
                                      item.getItemStatusId() == 2 ? "Đã bán" : "Lỗi");
                    replacements.add(dto);
                }
            }
        }
        return replacements;
    }

    public List<AccountSlot> getSlotsByAccountItemId(Integer accountItemId) {
        return accountSlotRepository.findByAccountItemIdIn(java.util.Collections.singletonList(accountItemId));
    }

    @Transactional
    public AccountSlot addSlotToAccountItem(Integer accountItemId, String slotName, String pinCode) {
        AccountItem item = accountItemRepository.findById(accountItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản để bán"));
        AccountSlot slot = new AccountSlot();
        slot.setAccountItemId(accountItemId);
        slot.setSlotName(slotName);
        slot.setPinCode(pinCode != null ? pinCode : "0000");
        slot.setSlotStatusId(1); // 1 = AVAILABLE
        slot.setCreatedAt(LocalDateTime.now());
        return accountSlotRepository.save(slot);
    }

    @Transactional
    public AccountSlot updateSlot(Integer slotId, String slotName, String pinCode, Integer slotStatusId) {
        AccountSlot slot = accountSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Slot chia sẻ"));
        slot.setSlotName(slotName);
        slot.setPinCode(pinCode != null ? pinCode : "0000");
        if (slotStatusId != null) {
            slot.setSlotStatusId(slotStatusId);
        }
        slot.setUpdatedAt(LocalDateTime.now());
        return accountSlotRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(Integer slotId) {
        accountSlotRepository.deleteById(slotId);
    }

    @Transactional
    public void refundOrder(Integer orderId, java.math.BigDecimal refundAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getOrderStatusId() != null && order.getOrderStatusId() == 5) {
            throw new RuntimeException("Đơn hàng đã được hoàn tiền");
        }

        // Cập nhật trạng thái đơn hàng thành Refunded (5)
        order.setOrderStatusId(5); // 5 = REFUNDED
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Xác định số tiền hoàn lại (mặc định là tổng tiền đơn hàng nếu không truyền vào)
        java.math.BigDecimal finalAmount = refundAmount != null ? refundAmount : order.getTotalAmount();

        // Hoàn tiền vào ví khách hàng
        Account customerAcc = accountRepository.findById(order.getAccountId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản khách hàng"));
        customerAcc.setBalance(customerAcc.getBalance().add(finalAmount));
        accountRepository.save(customerAcc);

        // Lưu log giao dịch
        Transaction transaction = new Transaction();
        transaction.setAccountId(customerAcc.getAccountId());
        transaction.setOrderId(order.getOrderId());
        transaction.setAmount(finalAmount); // positive balance add
        transaction.setTransactionTypeId(4); // REFUND
        transaction.setTransactionStatusId(2); // SUCCESS
        transaction.setPaymentMethodId(1); // WALLET
        transaction.setDescription("Hoàn tiền đơn hàng #" + order.getOrderId());
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        // Giải phóng slot / account item về trạng thái Sẵn sàng (1)
        List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
        for (OrderDetail detail : details) {
            if (detail.getAccountSlotId() != null) {
                accountSlotRepository.findById(detail.getAccountSlotId()).ifPresent(slot -> {
                    slot.setSlotStatusId(1); // 1 = AVAILABLE
                    accountSlotRepository.save(slot);
                });
            } else if (detail.getAccountItemId() != null) {
                accountItemRepository.findById(detail.getAccountItemId()).ifPresent(item -> {
                    item.setItemStatusId(1); // 1 = AVAILABLE
                    accountItemRepository.save(item);
                });
            }
        }
    }

    @Transactional
    public void resolveTicket(Integer ticketId, String resolutionNotes, Integer newStatusId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu hỗ trợ"));
        ticket.setTicketStatusId(newStatusId);
        ticketRepository.save(ticket);

        // Có thể lưu thêm TicketReply với resolutionNotes ở đây.
    }

    // --- Subscription Plans ---
    public List<SubscriptionPlan> getAllSubscriptionPlans() {
        return subscriptionPlanRepository.findAll();
    }

    @Transactional
    public SubscriptionPlan saveSubscriptionPlan(SubscriptionPlan plan) {
        if (plan.getPlanId() != null) {
            SubscriptionPlan existing = subscriptionPlanRepository.findById(plan.getPlanId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy gói"));
            existing.setPlanName(plan.getPlanName());
            existing.setDurationDays(plan.getDurationDays());
            existing.setIsActive(plan.getIsActive());
            existing.setUpdatedAt(LocalDateTime.now());
            return subscriptionPlanRepository.save(existing);
        } else {
            plan.setCreatedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());
            if (plan.getIsActive() == null)
                plan.setIsActive(true);
            return subscriptionPlanRepository.save(plan);
        }
    }

    // --- Product Subscriptions (Pricing) ---
    public List<ProductSubscription> getAllProductSubscriptions() {
        return productSubscriptionRepository.findAll();
    }

    @Transactional
    public ProductSubscription saveProductSubscription(ProductSubscription sub) {
        if (sub.getProductSubscriptionId() != null) {
            // Update existing
            ProductSubscription existing = productSubscriptionRepository.findById(sub.getProductSubscriptionId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy gói đăng ký"));
            existing.setProductId(sub.getProductId());
            existing.setPlanId(sub.getPlanId());
            existing.setPrice(sub.getPrice());
            existing.setIsActive(sub.getIsActive());
            existing.setUpdatedAt(LocalDateTime.now());
            return productSubscriptionRepository.save(existing);
        } else {
            // Create new
            sub.setCreatedAt(LocalDateTime.now());
            sub.setUpdatedAt(LocalDateTime.now());
            if (sub.getIsActive() == null)
                sub.setIsActive(true);
            return productSubscriptionRepository.save(sub);
        }
    }

    @Transactional
    public void toggleProductSubscriptionStatus(Integer id, Boolean isActive) {
        ProductSubscription sub = productSubscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói đăng ký"));
        sub.setIsActive(isActive);
        productSubscriptionRepository.save(sub);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream().map(product -> {
            ProductDTO dto = new ProductDTO();
            dto.setProductId(product.getProductId());
            dto.setCategoryId(product.getCategoryId());
            dto.setProductName(product.getProductName());
            dto.setDescription(product.getDescription());
            dto.setImageUrl(product.getImageUrl());
            dto.setIsContactSeller(product.getIsContactSeller());
            dto.setIsInputEmailRequired(product.getIsInputEmailRequired());
            dto.setProductStatusId(product.getProductStatusId());

            categoryRepository.findById(product.getCategoryId())
                    .ifPresent(c -> dto.setCategoryName(c.getCategoryName()));

            return dto;
        }).collect(Collectors.toList());
    }

    public PagedResponse<UserDTO> getUsersPaged(Integer statusId, Integer roleId, String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = accountRepository.findIdsPaged(statusId, roleId, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<UserDTO> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            List<Account> accounts = accountRepository.findByAccountIdInOrderByAccountIdDesc(queryIds);
            java.util.Map<Integer, String> roleMap = roleRepository.findAll().stream()
                    .collect(Collectors.toMap(Role::getRoleId, Role::getRoleName, (a, b) -> a));
            content = accounts.stream().map(acc -> {
                UserDTO dto = new UserDTO();
                dto.setAccountId(acc.getAccountId());
                dto.setUsername(acc.getUsername());
                dto.setEmail(acc.getEmail());
                dto.setFullName(acc.getFullName());
                dto.setBalance(acc.getBalance());
                dto.setBalanceLocked(Boolean.TRUE.equals(acc.getBalanceLocked()));
                dto.setAccountStatusId(acc.getAccountStatusId());
                dto.setCreatedAt(acc.getCreatedAt());
                dto.setRoleName(roleMap.getOrDefault(acc.getRoleId(), "UNKNOWN"));
                return dto;
            }).collect(Collectors.toList());
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<ProductDTO> getProductsPaged(Integer categoryId, Integer statusId, String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = productRepository.findIdsPaged(categoryId, statusId, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<ProductDTO> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            List<Product> products = productRepository.findByProductIdInOrderByProductIdDesc(queryIds);
            java.util.Map<Integer, Category> categoryMap = categoryRepository.findAll().stream()
                    .collect(Collectors.toMap(Category::getCategoryId, c -> c, (a, b) -> a));
            content = products.stream().map(product -> {
                ProductDTO dto = new ProductDTO();
                dto.setProductId(product.getProductId());
                dto.setCategoryId(product.getCategoryId());
                dto.setProductName(product.getProductName());
                dto.setDescription(product.getDescription());
                dto.setImageUrl(product.getImageUrl());
                dto.setIsContactSeller(product.getIsContactSeller());
                dto.setIsInputEmailRequired(product.getIsInputEmailRequired());
                dto.setProductStatusId(product.getProductStatusId());
                Category cat = categoryMap.get(product.getCategoryId());
                if (cat != null) {
                    dto.setCategoryName(cat.getCategoryName());
                    dto.setCategoryActive(cat.getIsActive());
                } else {
                    dto.setCategoryName("UNKNOWN");
                    dto.setCategoryActive(false);
                }
                return dto;
            }).collect(Collectors.toList());
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<Category> getCategoriesPaged(Boolean isActive, String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = categoryRepository.findIdsPaged(isActive, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<Category> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            content = categoryRepository.findByCategoryIdInOrderByCategoryIdDesc(queryIds);
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<AdminInventoryDTO> getInventoryPaged(Integer productId, Integer itemStatusId, String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = accountItemRepository.findIdsPaged(productId, itemStatusId, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<AdminInventoryDTO> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            List<AccountItem> items = accountItemRepository.findByAccountItemIdInOrderByAccountItemIdDesc(queryIds);
            java.util.Map<Integer, String> productMap = productRepository.findAll().stream()
                    .collect(Collectors.toMap(Product::getProductId, Product::getProductName, (a, b) -> a));

            List<Integer> accountItemIds = items.stream().map(AccountItem::getAccountItemId).collect(Collectors.toList());
            List<AccountSlot> allSlots = accountItemIds.isEmpty() ? new java.util.ArrayList<>() 
                    : accountSlotRepository.findByAccountItemIdIn(accountItemIds);
            java.util.Map<Integer, List<AccountSlot>> slotsMap = allSlots.stream()
                    .collect(Collectors.groupingBy(AccountSlot::getAccountItemId));

            content = items.stream().map(item -> {
                AdminInventoryDTO dto = new AdminInventoryDTO();
                dto.setAccountItemId(item.getAccountItemId());
                dto.setProductId(item.getProductId());
                dto.setAccountEmail(item.getAccountEmail());
                dto.setAccountPassword(item.getAccountPassword());
                dto.setItemStatusId(item.getItemStatusId());
                dto.setCreatedAt(item.getCreatedAt());
                dto.setProductName(productMap.getOrDefault(item.getProductId(), "UNKNOWN"));
                dto.setStatusName(
                        item.getItemStatusId() == 1 ? "Sẵn sàng" : item.getItemStatusId() == 2 ? "Đã bán" : "Lỗi");

                List<AccountSlot> slots = slotsMap.get(item.getAccountItemId());
                if (slots != null && !slots.isEmpty()) {
                    dto.setTotalSlots(slots.size());
                    dto.setSoldSlots((int) slots.stream().filter(s -> s.getSlotStatusId() == 2).count());
                    dto.setFreeSlots((int) slots.stream().filter(s -> s.getSlotStatusId() == 1).count());
                }
                return dto;
            }).collect(Collectors.toList());
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<SubscriptionPlan> getSubscriptionPlansPaged(String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = subscriptionPlanRepository.findIdsPaged(keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<SubscriptionPlan> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            content = subscriptionPlanRepository.findByPlanIdInOrderByPlanIdDesc(queryIds);
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<ProductSubscription> getProductSubscriptionsPaged(Integer productId, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = productSubscriptionRepository.findIdsPaged(productId, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<ProductSubscription> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            content = productSubscriptionRepository.findByProductSubscriptionIdInOrderByProductSubscriptionIdDesc(queryIds);
        }
        return new PagedResponse<>(content, hasMore);
    }

    public PagedResponse<TransactionDTO> getTransactionsPaged(Integer statusId, Integer accountId, String keyword, Integer lastId, int limit) {
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<Integer> ids = transactionRepository.findIdsPaged(statusId, accountId, keyword, lastId, pageable);
        boolean hasMore = ids.size() > limit;
        List<Integer> queryIds = hasMore ? ids.subList(0, limit) : ids;

        List<TransactionDTO> content = new java.util.ArrayList<>();
        if (!queryIds.isEmpty()) {
            List<Transaction> transactions = transactionRepository.findByTransactionIdInOrderByTransactionIdDesc(queryIds);
            java.util.Map<Integer, String> accountMap = accountRepository.findAll().stream()
                    .collect(Collectors.toMap(Account::getAccountId, Account::getUsername, (a, b) -> a));
            java.util.Map<Integer, String> statusMap = transactionStatusRepository.findAll().stream()
                    .collect(Collectors.toMap(TransactionStatus::getTransactionStatusId, TransactionStatus::getStatusName, (a, b) -> a));
            java.util.Map<Integer, String> paymentMap = paymentMethodRepository.findAll().stream()
                    .collect(Collectors.toMap(PaymentMethod::getPaymentMethodId, PaymentMethod::getMethodName, (a, b) -> a));
            java.util.Map<Integer, String> typeMap = transactionTypeRepository.findAll().stream()
                    .collect(Collectors.toMap(TransactionType::getTransactionTypeId, TransactionType::getTypeName, (a, b) -> a));

            content = transactions.stream().map(tx -> {
                TransactionDTO dto = new TransactionDTO();
                dto.setTransactionId(tx.getTransactionId());
                dto.setAccountId(tx.getAccountId());
                dto.setUsername(accountMap.getOrDefault(tx.getAccountId(), "UNKNOWN"));
                dto.setOrderId(tx.getOrderId());
                dto.setAmount(tx.getAmount());
                dto.setTransactionTypeId(tx.getTransactionTypeId());
                dto.setTransactionTypeName(typeMap.getOrDefault(tx.getTransactionTypeId(), "UNKNOWN"));
                dto.setPaymentMethodId(tx.getPaymentMethodId());
                dto.setPaymentMethodName(paymentMap.getOrDefault(tx.getPaymentMethodId(), "UNKNOWN"));
                dto.setDescription(tx.getDescription());
                dto.setTransactionStatusId(tx.getTransactionStatusId());
                dto.setTransactionStatusName(statusMap.getOrDefault(tx.getTransactionStatusId(), "UNKNOWN"));
                dto.setCreatedAt(tx.getCreatedAt());
                dto.setUpdatedAt(tx.getUpdatedAt());
                return dto;
            }).collect(Collectors.toList());
        }
        return new PagedResponse<>(content, hasMore);
    }

    @Transactional
    public void manualCreditBalance(Integer accountId, java.math.BigDecimal amount, String note) {
        if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền cộng phải lớn hơn 0");
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        // Cộng tiền vào ví
        account.setBalance(account.getBalance().add(amount));
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);

        // Ghi log giao dịch — type 5 = MANUAL_CREDIT (seed nếu chưa có)
        transactionTypeRepository.findAll().stream()
                .filter(t -> "MANUAL_CREDIT".equalsIgnoreCase(t.getTypeName()))
                .findFirst()
                .orElseGet(() -> {
                    com.dat64bit.shop.accountshop.entity.TransactionType newType = new com.dat64bit.shop.accountshop.entity.TransactionType();
                    newType.setTypeName("MANUAL_CREDIT");
                    newType.setDescription("Cộng tiền thủ công bởi Admin");
                    return transactionTypeRepository.save(newType);
                });

        Integer manualCreditTypeId = transactionTypeRepository.findAll().stream()
                .filter(t -> "MANUAL_CREDIT".equalsIgnoreCase(t.getTypeName()))
                .findFirst()
                .map(t -> t.getTransactionTypeId())
                .orElse(5);

        Transaction tx = new Transaction();
        tx.setAccountId(accountId);
        tx.setAmount(amount);
        tx.setTransactionTypeId(manualCreditTypeId);
        tx.setTransactionStatusId(2); // SUCCESS
        tx.setPaymentMethodId(1);     // WALLET
        tx.setDescription(note != null && !note.isBlank() ? note : "Cộng tiền thủ công bởi Admin");
        tx.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(tx);
    }

    @Transactional
    public void toggleBalanceLock(Integer accountId, boolean lock) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        account.setBalanceLocked(lock);
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);
    }
}
