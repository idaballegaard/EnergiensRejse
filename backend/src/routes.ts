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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'request body must be a JSON object' })
    return
  }

  if (typeof body.message !== 'string') {
    res.status(400).json({ error: 'message must be a string' })
    return
  }

  const message = body.message.trim()

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

  if (body.history != null && !Array.isArray(body.history)) {
    res.status(400).json({ error: 'history must be an array when provided' })
    return
  }

  const rawHistory = Array.isArray(body.history) ? body.history : []
  const history: ChatHistoryMessage[] = []

  for (const item of rawHistory.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      res.status(400).json({ error: 'history items must be objects' })
      return
    }

    if (item.role !== 'user' && item.role !== 'assistant') {
      res.status(400).json({ error: 'history role must be user or assistant' })
      return
    }

    if (typeof item.content !== 'string') {
      res.status(400).json({ error: 'history content must be a string' })
      return
    }

    const content = item.content.trim()
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
