package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.request.LoginRequest;
import com.dat64bit.shop.accountshop.dto.request.RegisterRequest;
import com.dat64bit.shop.accountshop.dto.response.AuthResponse;
import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.entity.Role;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.repository.RoleRepository;
import com.dat64bit.shop.accountshop.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Lưu active token vào DB để phục vụ kiểm tra/thu hồi phiên đăng nhập
        account.setToken(jwt);
        accountRepository.save(account);

        Role role = roleRepository.findById(account.getRoleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền hạn"));

        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setType("Bearer");
        response.setAccountId(account.getAccountId());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());
        response.setRole(role.getRoleName());
        response.setBalance(account.getBalance());
        return response;
    }

    public void logout(String username) {
        Account account = accountRepository.findByUsername(username).orElse(null);
        if (account != null) {
            account.setToken(null);
            accountRepository.save(account);
        }
    }

    public AuthResponse getCurrentUser(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + username));

        Role role = roleRepository.findById(account.getRoleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền hạn"));

        AuthResponse response = new AuthResponse();
        response.setToken(account.getToken());
        response.setType("Bearer");
        response.setAccountId(account.getAccountId());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());
        response.setRole(role.getRoleName());
        response.setBalance(account.getBalance());
        return response;
    }

    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.findAll().stream().anyMatch(a -> a.getUsername().equals(request.getUsername()))) {
            throw new RuntimeException("Lỗi: Tên đăng nhập đã tồn tại!");
        }

        if (accountRepository.findAll().stream().anyMatch(a -> a.getEmail().equals(request.getEmail()))) {
            throw new RuntimeException("Lỗi: Email đã được sử dụng!");
        }

        // Mặc định tạo Role Customer
        Role role = roleRepository.findAll().stream()
                .filter(r -> r.getRoleName().equalsIgnoreCase("Customer"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy quyền hạn."));

        // Mặc định Status Active (giả sử ID = 1)
        
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setBalance(BigDecimal.ZERO);
        account.setRoleId(role.getRoleId());
        account.setAccountStatusId(1); // Active
        account.setCreatedAt(LocalDateTime.now());

        accountRepository.save(account);

        // Auto login sau khi đăng ký
        return login(new LoginRequest(request.getUsername(), request.getPassword()));
    }
}
