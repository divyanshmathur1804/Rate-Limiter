package com.tools.ratelimiter;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import com.tools.ratelimiter.service.RedisTokenBucketService;

@SpringBootTest
public class RedisTokenBucketServiceTest {

    @Autowired
    private RedisTokenBucketService redisTokenBucketService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @BeforeEach
    void cleanup(){
        stringRedisTemplate.delete("bucket:integrationTestClient");

    }

    @Test
    void freshClient_allowsUpToCapacity_thenRejects() {
        String clientId = "integrationTestClient";
        int capacity = 5;
        double refillRate = 0; // isolate capacity logic, no refill interference

        for (int i = 0; i < capacity; i++) {
            assertTrue(redisTokenBucketService.tryConsume(clientId, capacity, refillRate));
        }

        assertFalse(redisTokenBucketService.tryConsume(clientId, capacity, refillRate));
    } 
}
