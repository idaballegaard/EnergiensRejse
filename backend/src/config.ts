import dotenv from 'dotenv'

dotenv.config()

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null) {
    return fallback
  }
  return value.toLowerCase() === 'true'
}

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toList(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  baseUrl: process.env.BASE_URL ?? 'https://your-provider.example/v1',
  apiKey: process.env.API_KEY ?? 'replace-with-real-api-key',
  model: process.env.MODEL ?? 'model-name',
  chatUseMock: toBool(process.env.CHAT_USE_MOCK, true),
  timeoutMs: Number(process.env.TIMEOUT_MS ?? 60000),
  maxMessageLength: Number(process.env.CHAT_MAX_MESSAGE_LENGTH ?? 2000),
  corsAllowedOrigins: toList(process.env.CORS_ALLOWED_ORIGINS, [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMaxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 30),
}
