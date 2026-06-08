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
  providerBaseUrl: process.env.PROVIDER_BASE_URL ?? 'https://your-provider.example/v1',
  providerApiKey: process.env.PROVIDER_API_KEY ?? 'replace-with-real-api-key',
  providerModel: process.env.PROVIDER_MODEL ?? 'model-name',
  chatUseMock: toBool(process.env.CHAT_USE_MOCK, true),
  providerTimeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS ?? 20000),
  maxMessageLength: Number(process.env.CHAT_MAX_MESSAGE_LENGTH ?? 2000),
}
