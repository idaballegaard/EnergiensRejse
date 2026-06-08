import { Router } from 'express'
import { config } from './config.js'

type ChatBody = {
  message?: string
}

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'wind-chat-backend' })
})

router.post('/api/chat', (req, res) => {
  const body = req.body as ChatBody
  const message = body?.message?.trim()

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  if (config.chatUseMock) {
    res.json({
      reply:
        'Mock-svar: Vindenergi opstår, når vindens bevægelsesenergi omdannes til elektricitet i en vindmølle. Er du nysgerrig på produktion, lagring eller elnettet?',
      mode: 'mock',
    })
    return
  }

  res.status(501).json({
    error: 'OpenAI provider not wired yet. Set CHAT_USE_MOCK=true until next step is implemented.',
  })
})

export default router
