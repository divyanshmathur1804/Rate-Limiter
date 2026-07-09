package com.tools.ratelimiter.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.tools.ratelimiter.DTO.ClientStatResponseDTO;
import com.tools.ratelimiter.service.RateLimiterService;
import com.tools.ratelimiter.service.RedisTokenBucketService;

@RestController
@CrossOrigin(origins = "*")
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

@GetMapping("/api/stats")
public HashMap<String, Object> getStats() {
    List<ClientStatResponseDTO> clientList = new ArrayList<>();
    long totalAllowed = 0;
    long totalRejected = 0;

    for (Map.Entry<String, AtomicInteger[]> entry : redisTokenBucketService.getStats().entrySet()) {
        String clientId = entry.getKey();
        long allowed = entry.getValue()[0].get();
        long rejected = entry.getValue()[1].get();

        ClientStatResponseDTO res = new ClientStatResponseDTO();
        res.setClientID(clientId);
        res.setAllowed(allowed);
        res.setRejected(rejected);
        res.setCapacity(10);
        res.setTokens(redisTokenBucketService.getCurrentTokens(clientId));

        clientList.add(res);
        totalAllowed += allowed;
        totalRejected += rejected;
    }

    HashMap<String, Object> map = new HashMap<>();
    map.put("clients", clientList);
    map.put("totalAllowed", totalAllowed);
    map.put("totalRejected", totalRejected);

    return map;
}
}
