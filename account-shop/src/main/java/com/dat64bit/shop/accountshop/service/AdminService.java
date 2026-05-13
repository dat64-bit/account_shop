package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.response.AdminDashboardDTO;
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

    public AdminDashboardDTO getDashboardStats() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        
        dto.setTotalUsers(accountRepository.count());
        
        // Count orders today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        long ordersToday = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfDay))
                .count();
        dto.setTotalOrdersToday(ordersToday);

        // Revenue (Sum of all completed orders)
        BigDecimal totalRevenue = orderDetailRepository.findAll().stream()
                .map(OrderDetail::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalRevenue(totalRevenue);

        // Pending tickets (giả sử status_id = 1 là PENDING)
        long pendingTickets = ticketRepository.findAll().stream()
                .filter(t -> t.getTicketStatusId() != null && t.getTicketStatusId() == 1)
                .count();
        dto.setPendingTickets(pendingTickets);

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
}
