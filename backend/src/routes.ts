import { Router } from 'express'
import { config } from './config.js'
import { getWindEnergyReply, ProviderRequestError } from './services/chatService.js'

type ChatBody = {
  message?: string
}

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'wind-chat-backend' })
})

router.post('/api/chat', async (req, res) => {
  const body = req.body as ChatBody
  const message = body?.message?.trim()

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  if (message.length > config.maxMessageLength) {
    res.status(400).json({
      error: `message is too long (max ${config.maxMessageLength} characters)`,
    })
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

  try {
    const result = await getWindEnergyReply(message)
    res.json(result)
  } catch (error: unknown) {
    if (error instanceof ProviderRequestError) {
      res.status(error.status).json({ error: error.message, mode: 'live' })
      return
    }

    res.status(500).json({ error: 'Unexpected chat error', mode: 'live' })
  }
})

export default router
