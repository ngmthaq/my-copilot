---
name: spring-boot-security
description: "Spring Boot security - SecurityFilterChain configuration, endpoint authorization, JWT/session auth, method security, password hashing, CORS/CSRF, and security testing. Use when: adding authentication and authorization to Spring Boot services. DO NOT USE FOR: persistence tuning or generic controller design without security context."
---

# Spring Boot Security

## 1. SecurityFilterChain Basics

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/orders/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
```

- Default-deny with explicit allow-list is safer.
- Disable auth mechanisms you do not use.

## 2. Password Hashing

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

- Never store plain text passwords.
- Use adaptive one-way hashing (`BCrypt`, `Argon2`).

## 3. JWT Authentication Flow

- Login endpoint validates credentials and issues signed JWT.
- Request filter extracts token, validates signature/expiration, sets auth context.
- Authorization checks roles/authorities from authenticated principal.

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            // validate token, then set SecurityContextHolder
        }

        chain.doFilter(request, response);
    }
}
```

## 4. Method-Level Authorization

```java
@Service
public class AdminService {

    @PreAuthorize("hasRole('ADMIN')")
    public void rotateKeys() {
    }

    @PreAuthorize("hasAuthority('SCOPE_orders:write')")
    public void updateOrderStatus(Long orderId, String status) {
    }
}
```

- Use method security for defense in depth.
- Keep expressions simple and auditable.

## 5. CSRF and CORS

- For stateless JWT APIs, CSRF is commonly disabled.
- For cookie/session apps, keep CSRF enabled.
- Restrict CORS origins and methods.

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

## 6. Secure Defaults Checklist

- Use HTTPS everywhere.
- Set strong password policy and lockout/rate limits.
- Rotate signing keys and secrets.
- Validate JWT audience/issuer/expiry.
- Return consistent auth error responses without leaking internals.

## 7. Security Testing

```java
@WebMvcTest(controllers = OrderController.class)
class OrderControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRejectAnonymousRequest() throws Exception {
        mockMvc.perform(get("/api/v1/orders/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldAllowUserRequest() throws Exception {
        mockMvc.perform(get("/api/v1/orders/1"))
            .andExpect(status().isOk());
    }
}
```

## 8. Anti-Patterns

- Permitting `/**` during development and forgetting to tighten it.
- Trusting JWT claims without signature and issuer validation.
- Mixing role and authority semantics inconsistently.
- Logging tokens, passwords, or raw credentials.
