# Distributed Rate Limiter

A production-style, distributed token-bucket rate limiter built with Java, Spring Boot, and Redis — designed to stay correct under concurrent load, across multiple application instances, and even when Redis itself becomes unavailable.


https://github.com/user-attachments/assets/3bb1b60a-b06e-44f0-b5a9-bd8a418c1a76

 — live deployment on AWS (2 EC2 app instances + ALB + Redis), showing real-time throttling and shared state across instances.

---

## Why this project exists

Most rate limiter tutorials stop at "store a counter somewhere." This project goes further and deliberately tackles the problems that only show up in a real distributed deployment:

- **Race conditions** under concurrent requests to the same client
- **Coordinating state across multiple app instances**, not just one JVM's memory
- **Atomicity** of multi-step check-and-update logic in a distributed store
- **Graceful degradation** when the rate limiter's own dependency (Redis) goes down

## Architecture

```
                    ┌─────────────┐
   Internet ──────▶ │  AWS ALB    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐         ┌───────────────┐
      │ App Instance 1 │         │ App Instance 2 │
      │ (Spring Boot)  │         │ (Spring Boot)  │
      └───────┬────────┘         └───────┬────────┘
              │                          │
              └────────────┬─────────────┘
                            ▼
                    ┌───────────────┐
                    │     Redis      │
                    │  (shared state)│
                    └───────────────┘
```

Two independent Spring Boot instances sit behind an AWS Application Load Balancer. Neither instance holds any rate-limit state itself — all bucket state lives in Redis, so the rate limit is correctly enforced *per client*, regardless of which instance handles a given request.

## How it works: Token Bucket via Redis + Lua

Each client gets a token bucket (`capacity`, `refillRate`). Tokens refill continuously based on real elapsed time; each request consumes one token if available.

The naive implementation — `GET` current state, compute in application code, `SET` it back — is **not safe** across multiple instances: two instances could both read the same state before either writes back, allowing more requests through than the limit permits (a classic check-then-act race condition).

**The fix:** the entire read → refill → check → consume → write sequence is implemented as a single **Redis Lua script**, executed via `EVAL`. Redis guarantees a Lua script runs atomically — no other command can interleave mid-script, even under heavy concurrent access from multiple app instances. This is the same pattern used by rate limiters at companies like Stripe and GitHub.

```lua
-- simplified core logic
local tokens = redis.call('HGET', KEYS[1], 'tokens')
-- ... refill based on elapsed time, capped at capacity ...
-- ... consume 1 token if available ...
redis.call('HSET', KEYS[1], 'tokens', tokens, 'lastRefillTimeStamp', now)
return allowed
```

## Key engineering decisions

| Decision | Reasoning |
|---|---|
| **Token bucket over fixed/sliding window** | Allows natural bursts while still enforcing an average rate; simplest algorithm to reason about atomically. |
| **Redis Lua script over app-level locking** | `synchronized` works within a single JVM but does nothing across separate instances/processes. Lua scripting moves the atomic operation into Redis itself, where all instances actually share state. |
| **Fail-open on Redis failure** | A rate limiter's job is to protect against overload — it shouldn't itself become a single point of failure for the whole API. On Redis timeout/error, requests are allowed through (logged) rather than the API returning 500s during a Redis outage. |
| **`AtomicInteger` for in-memory stats counters** | Dashboard stats (allowed/rejected counts) are tracked separately from rate-limit-critical state, using thread-safe atomic counters to avoid lost updates under concurrent requests. |
| **In-memory prototype before Redis** | Built and unit-tested a single-JVM `TokenBucket` first to nail the algorithm and concurrency handling in isolation, before introducing distributed-systems complexity. |

## Proven, not assumed

- **Thread-safety**: JUnit test spins up 50 concurrent threads against one bucket and asserts successful consumes never exceed capacity.
- **Multi-instance correctness**: verified locally (two instances, different ports, shared Redis) and live on AWS (two EC2 instances behind an ALB) — a client's rate limit holds correctly regardless of which instance serves the request.
- **Persistence across restarts**: bucket state survives an application restart, since it lives in Redis, not JVM memory.
- **Fail-open resilience**: stopping the Redis container mid-traffic does not crash the API — verified via manual outage testing.
- **CI-enforced**: GitHub Actions runs the full test suite (including a live Redis service container) on every push.

## Tech stack

**Backend:** Java 21, Spring Boot, Spring Data Redis
**Data store:** Redis (atomic state via Lua/`EVAL`)
**Infra:** Docker, Docker Compose (local), AWS EC2 + Application Load Balancer (deployed demo)
**CI/CD:** GitHub Actions (build, test, Redis service container)
**Dashboard:** React + Recharts (real-time stats visualization)

## Running locally

```bash
docker-compose up --build
```

This starts the app and Redis together. Test it:

```bash
curl http://localhost:8080/api/testClient
```

## API

| Endpoint | Description |
|---|---|
| `GET /api/{clientId}` | Attempts to consume one token for the given client. Returns `200` if allowed, `429` if rate-limited. |
| `GET /api/stats` | Returns live per-client stats (tokens remaining, allowed/rejected counts) for the dashboard. |
| `GET /health` | Health check endpoint (used by the load balancer, bypasses rate limiting). |

## What I'd add next

- Sliding window algorithm as a second, comparable strategy
- Per-client configurable limits via an admin endpoint
- Metrics/alerting on how often fail-open is triggered (a proxy for Redis reliability)

---

*Built as a hands-on exploration of the distributed-systems concepts most commonly asked about in backend system design interviews — atomicity, concurrency, multi-instance state sharing, and graceful degradation.*
