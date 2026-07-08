local tokens = redis.call('HGET', KEYS[1], 'tokens')
local lastRefillTimeStamp = redis.call('HGET', KEYS[1], 'lastRefillTimeStamp')
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

if tokens == false then
    tokens = capacity
    lastRefillTimeStamp = now
else
    tokens = tonumber(tokens)
    lastRefillTimeStamp = tonumber(lastRefillTimeStamp)
end

local elapsedTime = now - lastRefillTimeStamp
local tokensToAdd = elapsedTime*refillRate

tokens = math.min(capacity, tokens+tokensToAdd)

local allowed = 0



if tokens >= 1 then
    tokens = tokens-1
    allowed = 1
end

redis.call('HSET', KEYS[1], 'tokens', tokens, 'lastRefillTimeStamp', now)

return allowed