---
name: dotnet-cqrs-mediatr
description: "CQRS with MediatR in .NET - command/query separation, handlers, pipeline behaviors, validation, and transactional boundaries. Use when: structuring complex application flows with clear read/write separation. DO NOT USE FOR: simple CRUD services that do not need CQRS overhead."
---

# .NET CQRS and MediatR

## 1. Command and Query Contracts

```csharp
public sealed record CreateOrderCommand(Guid CustomerId, IReadOnlyList<OrderLineDto> Lines) : IRequest<Guid>;

public sealed record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDetailsDto>;
```

- Commands mutate state and return minimal data.
- Queries do not mutate and can shape read models directly.

## 2. Handlers

```csharp
public sealed class CreateOrderCommandHandler(IOrderRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var order = Order.Create(request.CustomerId, request.Lines);
        await repository.AddAsync(order, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return order.Id;
    }
}

public sealed class GetOrderByIdQueryHandler(IOrderReadRepository readRepository)
    : IRequestHandler<GetOrderByIdQuery, OrderDetailsDto>
{
    public async Task<OrderDetailsDto> Handle(GetOrderByIdQuery request, CancellationToken ct)
        => await readRepository.GetByIdAsync(request.OrderId, ct)
           ?? throw new NotFoundException($"Order {request.OrderId} not found");
}
```

## 3. Pipeline Behaviors

```csharp
public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var context = new ValidationContext<TRequest>(request);
        var failures = validators
            .Select(v => v.Validate(context))
            .SelectMany(result => result.Errors)
            .Where(error => error is not null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

- Keep cross-cutting concerns in behaviors: validation, logging, timing, authorization.

## 4. Registration

```csharp
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateOrderCommand).Assembly));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
```

## 5. Controller Usage

```csharp
[ApiController]
[Route("api/v1/orders")]
public sealed class OrdersController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateOrderCommand command, CancellationToken ct)
        => Ok(await mediator.Send(command, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDetailsDto>> GetById(Guid id, CancellationToken ct)
        => Ok(await mediator.Send(new GetOrderByIdQuery(id), ct));
}
```

## 6. Anti-Patterns

- Creating handlers that call each other recursively.
- Putting infrastructure logic directly in controllers.
- Applying CQRS to tiny apps where complexity is not justified.
- Returning entities directly from query handlers.
