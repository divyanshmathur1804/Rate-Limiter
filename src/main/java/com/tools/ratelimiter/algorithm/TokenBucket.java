package com.tools.ratelimiter.algorithm;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenBucket {
    private final double capacity;
    private double tokens;
    private long refillRate;
    private long lastRefillTimestamp;

    public TokenBucket(double capacity, long refillRate) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillRate = refillRate;
        this.lastRefillTimestamp = System.nanoTime();
    }

    public synchronized boolean tryConsume(){
       long now = System.nanoTime();
       double duration = (now - lastRefillTimestamp)/ Math.pow(10.0, 9.0);
       double totalTokens = duration*refillRate;
       
       tokens = Math.min(capacity, tokens + totalTokens);
       lastRefillTimestamp = now;

       
       
       if(tokens >= 1){
        tokens -= 1;
        return true;
       }

       
        
        return false;

    }
}
