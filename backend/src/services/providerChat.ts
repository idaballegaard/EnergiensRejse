import { config } from '../config.js'

const WIND_ENERGY_SYSTEM_PROMPT =
  'Du er en venlig og fagligt korrekt chatbot om vindenergi. Svar altid pa dansk i korte, klare forklaringer. Hold fokus pa vindenergi, elnet, lagring og relaterede emner.'

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
  const apiKey = config.providerApiKey.trim()
  if (!apiKey || apiKey === 'replace-with-real-api-key') {
    throw new ProviderRequestError('PROVIDER_API_KEY is not configured for live mode.', 500)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, config.providerTimeoutMs)

  try {
    const response = await fetch(`${config.providerBaseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.providerModel,
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
    const reply = data.choices?.[0]?.message?.content?.trim()

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
      throw new ProviderRequestError('Provider request timed out.', 504)
    }

    throw new ProviderRequestError('Provider request failed unexpectedly.', 502)
  } finally {
    clearTimeout(timeout)
  }
}
