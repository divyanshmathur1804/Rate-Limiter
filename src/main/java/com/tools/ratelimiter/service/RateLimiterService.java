package com.tools.ratelimiter.service;


import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.tools.ratelimiter.algorithm.TokenBucket;

@Service
public class RateLimiterService {
    private final ConcurrentHashMap<String, TokenBucket> map = new ConcurrentHashMap<>();

public boolean checkClient(String clientId) {
    TokenBucket bucket = map.computeIfAbsent(clientId, id -> new TokenBucket(30, 5));
    return bucket.tryConsume();
}
    
}
