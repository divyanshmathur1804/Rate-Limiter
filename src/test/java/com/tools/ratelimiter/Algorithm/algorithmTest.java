package com.tools.ratelimiter.Algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;

import com.tools.ratelimiter.algorithm.TokenBucket;

public class algorithmTest {


    @Test
    void freshBucket_allowsUpToCapacity_ThenRejects(){
        TokenBucket bucket = new TokenBucket(5, 1);
        boolean[] check = new boolean[10];
        for(int i = 0; i < 10; i++){
            check[i] = bucket.tryConsume();

            if(i < 5){
               assertEquals(true, check[i]);
            }else{
                 assertEquals(false, check[i]);
            }


        }

    }

   @Test
    void concurrentRequests_neverExceedCapacity() throws InterruptedException {
        // Arrange: Capacity of 10 tokens
        TokenBucket bucket = new TokenBucket(10, 0);
        ExecutorService executor = Executors.newFixedThreadPool(50);
        
        // Use AtomicInteger to safely count successful consumptions across 50 threads
        AtomicInteger successfulConsumptions = new AtomicInteger(0);

        // Act: Submit 50 concurrent requests
        for (int i = 0; i < 50; i++) {
            executor.submit(() -> {
                if (bucket.tryConsume()) {
                    successfulConsumptions.incrementAndGet();
                }
            });
        }

        // Essential: Shut down executor and wait for all 50 threads to finish their work
        executor.shutdown();
        boolean finishedCleanly = executor.awaitTermination(5, TimeUnit.SECONDS);
        
        // Assert: Ensure the test waited properly
        assertEquals(true, finishedCleanly, "Threads did not finish execution in time");
        
        // Assert: Exactly 10 requests should succeed, the other 40 must fail
        assertEquals(10, successfulConsumptions.get(), 
            "Token bucket allowed more than its capacity under concurrent load!");
    }
    
}
