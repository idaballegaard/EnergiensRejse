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
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  openaiApiKey: process.env.OPENAI_API_KEY ?? 'replace-with-real-api-key',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
  chatUseMock: toBool(process.env.CHAT_USE_MOCK, true),
}
