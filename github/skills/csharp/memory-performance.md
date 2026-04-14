---
name: csharp-memory-performance
description: "C# memory and performance guidance - covers allocation reduction, Span/Memory usage, pooling, measurement, and hot-path optimization. Use when: profiling or optimizing C# code."
---

# Memory and Performance

## Measure First

- Use BenchmarkDotNet for microbenchmarks.
- Use dotnet-trace/dotnet-counters for runtime analysis.
- Optimize only measured hot paths.

## Allocation Reduction

- Reuse objects where appropriate.
- Prefer `StringBuilder` for repeated concatenation.
- Use `ArrayPool<T>` for temporary large buffers.
- Avoid accidental boxing in tight loops.

## Span and Memory

- Use `Span<T>`/`ReadOnlySpan<T>` for stack or slice-oriented processing.
- Avoid storing `Span<T>` in fields; keep usage local.

```csharp
public static int CountCommas(ReadOnlySpan<char> text)
{
    var count = 0;
    foreach (var ch in text)
    {
        if (ch == ',') count++;
    }
    return count;
}
```

## Practical Checklist

- Minimize LINQ allocations in very hot loops.
- Cache repeated reflection or regex operations.
- Prefer `ValueTask` only when profiling shows benefit.
