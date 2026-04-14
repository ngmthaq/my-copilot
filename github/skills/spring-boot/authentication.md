---
name: spring-boot-authentication
description: "Spring Boot authentication - login flows, JWT/session setup, token validation filters, user details integration, and secure credential handling. Use when: implementing authentication in Spring Boot APIs. DO NOT USE FOR: broad authorization policy modeling or endpoint documentation."
---

# Spring Boot Authentication

## 1. Authentication Model Choice

- Stateless APIs: JWT/Bearer token.
- Browser/server sessions: cookie + session auth.
- Service-to-service: OAuth2 client credentials or mTLS where required.

## 2. Password Handling

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

- Hash passwords with adaptive algorithms (`BCrypt`/`Argon2`).
- Never log raw credentials.

## 3. UserDetails Integration

```java
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .authorities(user.getAuthorities())
            .build();
    }
}
```

## 4. JWT Filter Flow

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            // validate signature, expiry, issuer, audience
            // build Authentication and set SecurityContextHolder
        }

        chain.doFilter(request, response);
    }
}
```

- Validate signature and critical claims before trusting token content.
- Keep token parsing isolated in a dedicated component.

## 5. Login Endpoint Pattern

```java
@PostMapping("/api/v1/auth/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    // authenticate credentials
    // issue access/refresh token pair
    return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
}
```

- Add brute-force protection and rate limits to login endpoints.
- Keep auth responses minimal and explicit.

## 6. Session-Based Authentication Notes

- Keep CSRF enabled for cookie/session applications.
- Configure secure, httpOnly, sameSite cookies.
- Rotate session IDs after login.

## 7. Token Lifecycle

- Short-lived access tokens; longer refresh tokens.
- Revoke refresh tokens on logout/password reset.
- Rotate signing keys with planned overlap window.

## 8. Anti-Patterns

- Using plain text passwords or reversible encryption.
- Trusting unsigned/weakly validated JWT claims.
- Long-lived bearer tokens without rotation.
- Returning verbose auth failure details (user enumeration risk).
