package com.tools.ratelimiter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.tools.ratelimiter.service.RateLimiterService;
import com.tools.ratelimiter.service.RedisTokenBucketService;

@RestController
public class rateLimitController {
    private RateLimiterService rateLimiterService;
    private RedisTokenBucketService redisTokenBucketService;

    public rateLimitController(RateLimiterService rateLimiterService, RedisTokenBucketService redisTokenBucketService){
        this.rateLimiterService = rateLimiterService;
        this.redisTokenBucketService = redisTokenBucketService;
    }

    @GetMapping("/api/{clientId}")
    public ResponseEntity<String> check(@PathVariable String clientId) {
    boolean allowed = redisTokenBucketService.tryConsume(clientId, 10, 5.0);

    if (allowed) {
        return ResponseEntity.ok("Request allowed");
    } else {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Rate limit exceeded");
    }
}
}
