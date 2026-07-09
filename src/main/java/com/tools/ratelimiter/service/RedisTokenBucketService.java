package com.tools.ratelimiter.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.core.io.ClassPathResource;
@Service
public class RedisTokenBucketService {
    private StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, AtomicInteger[]> stats = new ConcurrentHashMap<>();

    private final RedisScript<Long> tokenBucketScript = RedisScript.of(new ClassPathResource("scripts/tocken_bucket.lua"), Long.class); 

    public RedisTokenBucketService(StringRedisTemplate redisTemplate){
        this.redisTemplate = redisTemplate;
    }

public boolean tryConsume(String clientId, int capacity, double refillRate) {
    String key = "bucket:" + clientId;
    long now = System.currentTimeMillis();

    AtomicInteger[] clientStats = stats.computeIfAbsent(clientId, 
        id -> new AtomicInteger[]{ new AtomicInteger(0), new AtomicInteger(0) });

    try {
        Long result = redisTemplate.execute(
            tokenBucketScript,
            Collections.singletonList(key),
            String.valueOf(capacity),
            String.valueOf(refillRate),
            String.valueOf(now)
        );

        if (result != null && result == 1) {
            clientStats[0].incrementAndGet();
            return true;
        } else {
            clientStats[1].incrementAndGet();
            return false;
        }
    } catch (Exception e) {
        System.err.println("Redis unreachable, failing open for client " + clientId + ": " + e.getMessage());
        clientStats[0].incrementAndGet();
        return true;
    }
}

public ConcurrentHashMap<String, AtomicInteger[]> getStats() {
    return stats;
}

public double getCurrentTokens(String clientId) {
    String key = "bucket:" + clientId;
    String tokensStr = redisTemplate.<String, String>opsForHash().get(key, "tokens");
    return tokensStr != null ? Double.parseDouble(tokensStr) : 0.0;
}


}
