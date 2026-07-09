package com.tools.ratelimiter.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

import org.springframework.core.io.ClassPathResource;
@Service
public class RedisTokenBucketService {
    private StringRedisTemplate redisTemplate;

    private final RedisScript<Long> tokenBucketScript = RedisScript.of(new ClassPathResource("scripts/tocken_bucket.lua"), Long.class); 

    public RedisTokenBucketService(StringRedisTemplate redisTemplate){
        this.redisTemplate = redisTemplate;
    }

     public boolean tryConsume(String clientId, int capacity, double refillRate) {
        String key = "bucket:" + clientId;
        long now = System.currentTimeMillis(); // what time value, in what unit? think back to our earlier discussion

        Long result = redisTemplate.execute(
            tokenBucketScript,
            Collections.singletonList(key),
            String.valueOf(capacity),
            String.valueOf(refillRate),
            String.valueOf(now)
        );

        return result != null && result == 1;
    }


}
