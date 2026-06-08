import dotenv from 'dotenv'

dotenv.config()

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null) {
    return fallback
  }
  return value.toLowerCase() === 'true'
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  baseUrl: process.env.BASE_URL ?? 'https://your-provider.example/v1',
  apiKey: process.env.API_KEY ?? 'replace-with-real-api-key',
  model: process.env.MODEL ?? 'model-name',
  chatUseMock: toBool(process.env.CHAT_USE_MOCK, true),
  timeoutMs: Number(process.env.TIMEOUT_MS ?? 60000),
  maxMessageLength: Number(process.env.CHAT_MAX_MESSAGE_LENGTH ?? 2000),
}
