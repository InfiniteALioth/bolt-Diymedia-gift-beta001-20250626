import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Basic rate limiter using express-rate-limit
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000),
    });
  },
});

// Advanced rate limiter for specific endpoints
const authLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 5, // 5 attempts
  duration: 900, // per 15 minutes
});

const uploadLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 10, // 10 uploads
  duration: 3600, // per hour
});

export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: secs,
    });
  }
};

export const uploadRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await uploadLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many upload attempts, please try again later.',
      retryAfter: secs,
    });
  }
};