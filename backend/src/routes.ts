import { Router } from 'express'
import { config } from './config.js'
import { getWindEnergyReply, ProviderRequestError } from './services/chatService.js'

type ChatBody = {
  message?: string
  history?: Array<{
    role?: string
    content?: string
  }>
}

type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MAX_HISTORY_MESSAGES = 20

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

  const rawHistory = Array.isArray(body?.history) ? body.history : []
  const history: ChatHistoryMessage[] = []

  for (const item of rawHistory.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant')) {
      continue
    }
    const content = item.content?.trim()
    if (!content) {
      continue
    }
    if (content.length > config.maxMessageLength) {
      continue
    }
    history.push({ role: item.role, content })
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
    const result = await getWindEnergyReply(message, history)
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
