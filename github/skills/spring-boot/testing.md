---
name: spring-boot-testing
description: "Spring Boot testing - unit tests, slice tests, integration tests, Testcontainers, security testing, and test data patterns. Use when: designing reliable test coverage for Spring Boot services and APIs. DO NOT USE FOR: production deployment hardening or runtime observability setup."
---

# Spring Boot Testing

## 1. Testing Pyramid for Spring Boot

- Unit tests: service/domain logic with mocks, fastest feedback.
- Slice tests: MVC/JPA slices with focused framework integration.
- Integration tests: full context + database/container wiring.

## 2. Unit Tests (JUnit + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldCreateOrder() {
        var entity = new OrderEntity();
        when(orderRepository.save(any(OrderEntity.class))).thenReturn(entity);

        var result = orderService.create(new CreateOrderCommand(1L, List.of(), "USD"));

        assertNotNull(result);
        verify(orderRepository).save(any(OrderEntity.class));
    }
}
```

## 3. MVC Slice Tests

```java
@WebMvcTest(controllers = OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void shouldReturnNotFound() throws Exception {
        when(orderService.getById(99L)).thenThrow(new EntityNotFoundException("Order not found"));

        mockMvc.perform(get("/api/v1/orders/99"))
            .andExpect(status().isNotFound());
    }
}
```

- Use `@WebMvcTest` for HTTP contract behavior only.
- Keep DB/repository concerns out of MVC slices.

## 4. JPA Slice Tests

```java
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private OrderRepository repository;

    @Test
    void shouldFindByStatus() {
        var order = new OrderEntity();
        order.setStatus(OrderStatus.CREATED);
        em.persistAndFlush(order);

        var page = repository.findByStatus(OrderStatus.CREATED, PageRequest.of(0, 10));

        assertEquals(1, page.getTotalElements());
    }
}
```

## 5. Full Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateOrder() throws Exception {
        var body = """
            {"customerId":1,"items":[{"productId":2,"quantity":1}],"currency":"USD"}
            """;

        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());
    }
}
```

## 6. Testcontainers for Realistic Dependencies

```java
@Testcontainers
@SpringBootTest
class OrderPersistenceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configureProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

- Prefer Testcontainers for DB-integrated tests over in-memory substitutes for critical flows.

## 7. Security Testing

```java
@Test
@WithMockUser(roles = "ADMIN")
void shouldAllowAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/audit"))
        .andExpect(status().isOk());
}

@Test
void shouldRejectAnonymous() throws Exception {
    mockMvc.perform(get("/api/v1/admin/audit"))
        .andExpect(status().isUnauthorized());
}
```

## 8. Anti-Patterns

- Overusing `@SpringBootTest` for all tests.
- Sharing mutable test fixtures across test classes.
- Relying only on mocked tests for persistence-heavy features.
- Ignoring unhappy-path assertions.
