package com.tools.ratelimiter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.tools.ratelimiter.service.RateLimiterService;

@RestController
public class rateLimitController {
    private RateLimiterService rateLimiterService;

    public rateLimitController(RateLimiterService rateLimiterService){
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping("/api/{clientId}")
    public ResponseEntity<String> check(@PathVariable String clientId) {
    boolean allowed = rateLimiterService.checkClient(clientId);

    if (allowed) {
        return ResponseEntity.ok("Request allowed");
    } else {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Rate limit exceeded");
    }
}
}
