import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import routes from './routes.js'
import { createChatRateLimiter } from './middleware/chatRateLimit.js'

const app = express()

const chatRateLimiter = createChatRateLimiter(
  config.rateLimitWindowMs,
  config.rateLimitMaxRequests
)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      if (config.corsAllowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin not allowed'))
    },
  })
)
app.use(express.json({ limit: '32kb' }))
app.use('/api/chat', chatRateLimiter)
app.use(routes)

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`)
})
