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
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findById(account.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setType("Bearer");
        response.setAccountId(account.getAccountId());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());
        response.setRole(role.getRoleName());
        return response;
    }

    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.findAll().stream().anyMatch(a -> a.getUsername().equals(request.getUsername()))) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (accountRepository.findAll().stream().anyMatch(a -> a.getEmail().equals(request.getEmail()))) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Mặc định tạo Role Customer
        Role role = roleRepository.findAll().stream()
                .filter(r -> r.getRoleName().equalsIgnoreCase("Customer"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

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
