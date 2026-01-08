import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const inMemoryLimits: Record<string, { count: number, expires: number }> = {};

const createRateLimiter = () => {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || !redisToken) {
      console.warn('Redis credentials not found, falling back to in-memory rate limiting');
      return null;
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'rate-limit'
    });
  } catch (error) {
    console.error('Failed to initialize Redis rate limiter:', error);
    return null;
  }
};

const rateLimiter = createRateLimiter();

const rateLimit = {
  limit: async (identifier: string, maxRequests = 5, timeWindowSeconds = 60): Promise<{ success: boolean }> => {
    try {
      if (rateLimiter) {
        const { success } = await rateLimiter.limit(identifier);
        return { success };
      }

      const now = Date.now();
      const key = `${identifier}:${Math.floor(now / (timeWindowSeconds * 1000))}`;

      Object.keys(inMemoryLimits).forEach(k => {
        if (inMemoryLimits[k].expires < now) {
          delete inMemoryLimits[k];
        }
      });
      
      if (!inMemoryLimits[key]) {
        inMemoryLimits[key] = {
          count: 1,
          expires: now + timeWindowSeconds * 1000
        };
        return { success: true };
      }
      
      if (inMemoryLimits[key].count < maxRequests) {
        inMemoryLimits[key].count++;
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return { success: true };
    }
  }
};

export default rateLimit;