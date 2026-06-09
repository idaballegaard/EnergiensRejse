import type { Request, Response, NextFunction } from 'express'

type RateState = {
  windowStart: number
  count: number
}

export function createChatRateLimiter(windowMs: number, maxRequests: number) {
  const buckets = new Map<string, RateState>()

  return function chatRateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const bucket = buckets.get(ip)

    if (!bucket || now - bucket.windowStart >= windowMs) {
      buckets.set(ip, { windowStart: now, count: 1 })
      next()
      return
    }

    if (bucket.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - bucket.windowStart)) / 1000)
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)))
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' })
      return
    }

    bucket.count += 1
    next()
  }
}
