---
name: spring-boot-jpa-hibernate
description: "Spring Boot JPA/Hibernate - entity modeling, repository design, transactional services, fetch strategies, optimistic locking, and performance-safe query patterns. Use when: implementing persistence with Spring Data JPA and Hibernate. DO NOT USE FOR: REST contract design or authentication strategy."
---

# Spring Boot JPA/Hibernate

## 1. Entity Modeling

```java
@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrderStatus status;

    @Version
    private Long version;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLineEntity> lines = new ArrayList<>();

    protected OrderEntity() {
    }
}
```

- Prefer `EnumType.STRING` over ordinal.
- Add `@Version` for optimistic locking.
- Keep a protected no-arg constructor for JPA.

## 2. Relationships

```java
@Entity
@Table(name = "order_lines")
class OrderLineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private int quantity;
}
```

- Default to `LAZY` for associations.
- Avoid bidirectional relationships unless required.

## 3. Repositories

```java
public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {

    @EntityGraph(attributePaths = "lines")
    Optional<OrderEntity> findWithLinesById(Long id);

    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    @Query("select o from OrderEntity o where o.customerId = :customerId and o.status = :status")
    List<OrderEntity> findByCustomerAndStatus(Long customerId, OrderStatus status);
}
```

- Use derived queries for simple lookups.
- Use `@Query` or specifications for complex filters.

## 4. Transactional Service Pattern

```java
@Service
public class OrderPersistenceService {

    private final OrderRepository orderRepository;

    public OrderPersistenceService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderEntity create(OrderEntity entity) {
        return orderRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public OrderEntity get(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }
}
```

- Put transactional boundaries in service layer.
- Use `readOnly = true` for read paths.

## 5. Fetch and N+1 Control

- Use `@EntityGraph` for targeted eager loading.
- Use join fetch queries for aggregate reads.
- Keep transactions short and avoid Open Session in View for API-heavy services.

```java
@Query("select o from OrderEntity o join fetch o.lines where o.id = :id")
Optional<OrderEntity> findAggregateById(Long id);
```

## 6. Locking and Consistency

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("select o from OrderEntity o where o.id = :id")
Optional<OrderEntity> findForUpdate(Long id);
```

- Prefer optimistic locking by default.
- Use pessimistic locks only for proven contention-critical flows.

## 7. Migrations and Schema Evolution

- Use Flyway or Liquibase for schema versioning.
- Keep `ddl-auto=validate` in non-local environments.
- Never rely on auto schema mutation in production.

## 8. Anti-Patterns

- Exposing entities directly in controllers.
- Setting all relationships `EAGER`.
- Huge transactions with network calls inside.
- Ignoring indexes for high-cardinality lookup fields.
