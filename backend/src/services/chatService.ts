import { config } from '../config.js'
import { WIND_ENERGY_SYSTEM_PROMPT } from './chatPrompt.js'
import { sanitizeReply } from './chatSanitizer.js'

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export type ChatReply = {
  reply: string
  mode: 'live'
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export class ProviderRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ProviderRequestError'
    this.status = status
  }
}

export async function getWindEnergyReply(message: string): Promise<ChatReply> {
  const apiKey = config.apiKey.trim()
  if (!apiKey || apiKey === 'replace-with-real-api-key') {
    throw new ProviderRequestError('API_KEY is not configured for live mode.', 500)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, config.timeoutMs)

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: WIND_ENERGY_SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const raw = await response.text()
      const trimmed = raw.slice(0, 400)
      throw new ProviderRequestError(
        `Provider request failed (${response.status}): ${trimmed || 'No error body'}`,
        response.status
      )
    }

    const data = (await response.json()) as ChatCompletionResponse
    const rawReply = data.choices?.[0]?.message?.content?.trim()
    const reply = rawReply ? sanitizeReply(rawReply) : ''

    if (!reply) {
      throw new ProviderRequestError('Provider returned an empty response.', 502)
    }

    return {
      reply,
      mode: 'live',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    }
  } catch (error: unknown) {
    if (error instanceof ProviderRequestError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProviderRequestError(
        `Provider request timed out after ${config.timeoutMs}ms. Increase TIMEOUT_MS if your model responds slowly.`,
        504
      )
    }

    if (error instanceof Error) {
      const causeCode =
        typeof (error as Error & { cause?: { code?: string } }).cause?.code === 'string'
          ? (error as Error & { cause?: { code?: string } }).cause?.code
          : undefined

      if (causeCode === 'UND_ERR_CONNECT_TIMEOUT') {
        throw new ProviderRequestError(
          'Could not connect to provider in time (connect timeout). Check BASE_URL, network access, and whether the provider server is running.',
          502
        )
      }

      if (causeCode === 'ENOTFOUND') {
        throw new ProviderRequestError(
          'Provider host could not be resolved (DNS error). Verify BASE_URL host name.',
          502
        )
      }

      if (causeCode === 'ECONNREFUSED') {
        throw new ProviderRequestError(
          'Provider connection was refused. Verify BASE_URL port and that the provider service is running.',
          502
        )
      }
    }

    throw new ProviderRequestError('Provider request failed unexpectedly.', 502)
  } finally {
    clearTimeout(timeout)
  }
}
