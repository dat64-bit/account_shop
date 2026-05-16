package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.response.AdminDashboardDTO;
import com.dat64bit.shop.accountshop.dto.response.AdminInventoryDTO;
import com.dat64bit.shop.accountshop.dto.response.UserDTO;
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

    @Autowired private AccountRepository accountRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderDetailRepository orderDetailRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private AccountItemRepository accountItemRepository;
    @Autowired private AccountSlotRepository accountSlotRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private SubscriptionPlanRepository subscriptionPlanRepository;
    @Autowired private ProductSubscriptionRepository productSubscriptionRepository;

    public AdminDashboardDTO getDashboardStats() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        
        dto.setTotalUsers(accountRepository.count());
        
        LocalDateTime now = LocalDateTime.now();
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
                    .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(start) && d.getCreatedAt().isBefore(end))
                    .map(OrderDetail::getPrice)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueTrend.add(dayRevenue);

            long dayOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(start) && o.getCreatedAt().isBefore(end))
                    .count();
            orderTrend.add(dayOrders);
        }
        dto.setRevenueTrend(revenueTrend);
        dto.setOrderTrend(orderTrend);

        // --- Top Products ---
        // (Simplified logic: taking top products from the database)
        List<Product> products = productRepository.findAll();
        dto.setTopProductNames(products.stream().limit(6).map(Product::getProductName).collect(Collectors.toList()));
        dto.setTopProductSales(products.stream().limit(6).map(p -> (long) (Math.random() * 100)).collect(Collectors.toList()));
        dto.setTopProductPreviousSales(products.stream().limit(6).map(p -> (long) (Math.random() * 100)).collect(Collectors.toList()));

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
                .orElseThrow(() -> new RuntimeException("User not found"));
        acc.setAccountStatusId(statusId);
        accountRepository.save(acc);
    }

    @Transactional
    public Category saveCategory(Category category) {
        if (category.getCategoryId() == null) {
            category.setCreatedAt(LocalDateTime.now());
            if (category.getIsActive() == null) category.setIsActive(true);
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
            if (product.getProductStatusId() == null) product.setProductStatusId(1);
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

            dto.setStatusName(item.getItemStatusId() == 1 ? "Sẵn sàng" : item.getItemStatusId() == 2 ? "Đã bán" : "Lỗi");
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void toggleProductStatus(Integer productId, Integer statusId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
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
    public void replaceAccountForOrder(Integer orderDetailId, Integer newAccountItemId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Order detail not found"));
        
        // Thu hồi account cũ (đánh dấu lỗi)
        if (detail.getAccountItemId() != null) {
            accountItemRepository.findById(detail.getAccountItemId()).ifPresent(oldItem -> {
                oldItem.setItemStatusId(3); // 3 = BANNED / FAULTY
                accountItemRepository.save(oldItem);
            });
        }

        // Gán account mới
        detail.setAccountItemId(newAccountItemId);
        orderDetailRepository.save(detail);
        
        // Đánh dấu account mới là Đã bán (2)
        accountItemRepository.findById(newAccountItemId).ifPresent(newItem -> {
            newItem.setItemStatusId(2); // 2 = IN USE
            accountItemRepository.save(newItem);
        });
    }

    @Transactional
    public void resolveTicket(Integer ticketId, String resolutionNotes, Integer newStatusId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
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
                    .orElseThrow(() -> new RuntimeException("Plan not found"));
            existing.setPlanName(plan.getPlanName());
            existing.setDurationDays(plan.getDurationDays());
            existing.setIsActive(plan.getIsActive());
            existing.setUpdatedAt(LocalDateTime.now());
            return subscriptionPlanRepository.save(existing);
        } else {
            plan.setCreatedAt(LocalDateTime.now());
            plan.setUpdatedAt(LocalDateTime.now());
            if (plan.getIsActive() == null) plan.setIsActive(true);
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
                    .orElseThrow(() -> new RuntimeException("Subscription not found"));
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
            if (sub.getIsActive() == null) sub.setIsActive(true);
            return productSubscriptionRepository.save(sub);
        }
    }

    @Transactional
    public void toggleProductSubscriptionStatus(Integer id, Boolean isActive) {
        ProductSubscription sub = productSubscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setIsActive(isActive);
        productSubscriptionRepository.save(sub);
    }
}
