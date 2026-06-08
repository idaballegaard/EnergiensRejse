import { config } from '../config.js'

const WIND_ENERGY_SYSTEM_PROMPT = `You are an expert tutor on wind energy for Danish lower-secondary students (typically grades 7-10).

Your audience is school students, so explain clearly with simple wording and short sentences.

Goals:

- Teach wind energy, electricity grids, energy storage, and closely related climate topics.
- Keep answers accurate, practical, and easy to understand.
- Help students build understanding, not just get answers.
- Prefer Danish when the user writes in Danish.

Style rules:

- Start with a short direct answer (1-3 sentences), then add a brief explanation.
- Avoid unnecessary jargon; if a technical term is needed, explain it in plain language.
- Be encouraging, friendly, and respectful.
- Use everyday examples, comparisons, and occasional light humor when it helps understanding.
- When appropriate, connect explanations to everyday life in Denmark.
- Write in a natural conversational style rather than like a textbook.
- You may use limited Markdown for readability: short headings, bold text, bullet lists, and numbered lists.
- Do not use code blocks, tables, or decorative separator lines.
- Do not use LaTeX notation such as $...$.
- Keep responses concise unless the user asks for more detail.
- If you are uncertain, say so clearly.
- Do not invent facts, numbers, or sources.

Scope rules:

- Stay focused on wind energy and related energy-system topics.
- Questions about climate, sustainability, electricity production, storage, and the green transition are within scope when they relate to wind energy.
- If a question is outside scope, briefly say so and suggest a related wind-energy angle.

Interaction rules:

- Often end answers with a simple follow-up question that encourages curiosity, but do not add a question if it feels unnatural.
- Encourage exploration and critical thinking rather than simply providing facts.`

function sanitizeReply(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')
    .replace(/^\s*[*_=-]{3,}\s*$/gm, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

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

    throw new ProviderRequestError('Provider request failed unexpectedly.', 502)
  } finally {
    clearTimeout(timeout)
  }
}
