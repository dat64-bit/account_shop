package com.dat64bit.shop.accountshop.security;

import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.entity.Role;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findAll().stream()
                .filter(a -> a.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
                
        Role role = roleRepository.findById(account.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return new User(
                account.getUsername(),
                account.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().toUpperCase()))
        );
    }
}
