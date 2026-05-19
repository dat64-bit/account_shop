# ADR-007: Spring Security JWT Configuration for Spring Boot 4

## Status
Accepted

## Date
2026-05-14

## Context
Dự án sử dụng Spring Boot 4 (Spring Security 6+) với JWT stateless authentication. Trong quá trình debug, phát hiện hai vấn đề nghiêm trọng khiến tất cả các API `/api/admin/**` trả về `401 Unauthorized` dù token JWT hợp lệ:

1. **`DaoAuthenticationProvider` không được cấu hình tường minh** → `AuthenticationManager` mặc định không biết dùng `CustomUserDetailsService` hay `BCryptPasswordEncoder` → login trả về "Bad credentials" dù user tồn tại trong DB.

2. **`JwtAuthFilter` được đánh dấu `@Component`** → Spring Boot tự đăng ký nó như một servlet filter thông thường *ngoài* Spring Security filter chain. `OncePerRequestFilter` chỉ chạy logic một lần — lần đó là ở servlet layer. Khi Security chain chạy, `SecurityContextHolderFilter` tạo `SecurityContext` mới (trống, do STATELESS), bỏ qua authentication đã set → 401.

## Decision

### 1. `DaoAuthenticationProvider` phải được khai báo tường minh

```java
@Bean
public DaoAuthenticationProvider authenticationProvider() {
    // Spring Security 6+: UserDetailsService truyền qua constructor
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
}
```

Và wire vào `filterChain`:
```java
.authenticationProvider(authenticationProvider())
```

### 2. `JwtAuthFilter` phải là `@Bean` tường minh, không dùng `@Component`

```java
// SecurityConfig.java
@Bean
public JwtAuthFilter jwtAuthFilter() {
    return new JwtAuthFilter(jwtTokenProvider, userDetailsService);
}

// JwtAuthFilter.java — constructor injection, không @Autowired
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthFilter(JwtTokenProvider tokenProvider, CustomUserDetailsService customUserDetailsService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }
    // ...
}
```

Thêm vào security chain:
```java
http.addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);
```

### 3. Password trong DB phải là BCrypt hash

Dùng `BcryptUtil.main()` hoặc tương đương để generate hash đúng từ `BCryptPasswordEncoder` của chính project, rồi update DB:
```sql
UPDATE account SET password_hash = '$2a$10$...' WHERE username = 'admin01';
```

## Alternatives Considered

### `@Component` + `FilterRegistrationBean(setEnabled=false)`
- Giữ `@Component` nhưng disable auto-registration bằng `FilterRegistrationBean`
- **Bị loại**: Phức tạp hơn và dễ bị quên. Khai báo tường minh rõ ràng hơn về intent.

### `@Component` mà không có `FilterRegistrationBean`
- Là cách nhiều tutorial cũ hướng dẫn (Spring Boot 2.x)
- **Bị loại**: Gây double-registration, dẫn đến SecurityContext bị reset trong Spring Boot 4 (STATELESS mode).

### Không dùng `DaoAuthenticationProvider`
- Dựa vào Spring Security tự detect `UserDetailsService` bean
- **Bị loại**: Trong Spring Security 6, khi có custom `AuthenticationProvider` bean khác, auto-detect có thể không hoạt động đúng. Explicit luôn tốt hơn implicit.

## Consequences

- **JwtAuthFilter** chỉ chạy bên trong Spring Security filter chain, nơi `SecurityContext` được quản lý đúng cách.
- **Authentication flow** hoạt động đúng: `DaoAuthenticationProvider` → `CustomUserDetailsService` → `BCryptPasswordEncoder`.
- **Breaking change với Spring Boot 2.x patterns**: Bất kỳ tài liệu/tutorial cũ nào dùng `@Component` trên JWT filter đều không còn phù hợp với Spring Boot 4.
- Tất cả seed data user trong DB phải có `password_hash` là BCrypt string (`$2a$...`).

## References
- [Spring Security 6 Migration Guide](https://docs.spring.io/spring-security/reference/migration/index.html)
- Session debug: f4e589d9-4804-454a-8c73-74bfc076ff4c
