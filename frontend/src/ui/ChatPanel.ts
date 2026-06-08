type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  text: string
}

type ChatResponse = {
  reply?: string
  error?: string
}

const DEFAULT_CHAT_API_URL = 'http://localhost:8787/api/chat'

export default class ChatPanel {
  private root: HTMLElement
  private messagesEl: HTMLDivElement
  private formEl: HTMLFormElement
  private inputEl: HTMLTextAreaElement
  private sendBtn: HTMLButtonElement
  private statusEl: HTMLParagraphElement
  private apiUrl: string
  private isSending = false

  constructor() {
    this.apiUrl =
      (import.meta.env.VITE_CHAT_API_URL as string | undefined)?.trim() || DEFAULT_CHAT_API_URL

    this.root = document.createElement('aside')
    this.root.id = 'chat-panel'

    const header = document.createElement('div')
    header.className = 'chat-header'
    header.innerHTML = `
      <h2>Vindenergi - Spørg løs!</h2>
      <p>Er du nysgerrig på vindmøller, strøm, klima, miljø, teknologi eller fremtidens energi? Stil dit spørgsmål her.</p>
    `

    this.messagesEl = document.createElement('div')
    this.messagesEl.className = 'chat-messages'

    this.statusEl = document.createElement('p')
    this.statusEl.className = 'chat-status'

    this.formEl = document.createElement('form')
    this.formEl.className = 'chat-form'

    this.inputEl = document.createElement('textarea')
    this.inputEl.className = 'chat-input'
    this.inputEl.placeholder = 'Skriv dit spørgsmål her...'
    this.inputEl.rows = 2
    this.inputEl.maxLength = 2000

    this.sendBtn = document.createElement('button')
    this.sendBtn.type = 'submit'
    this.sendBtn.className = 'chat-send'
    this.sendBtn.textContent = 'Send'

    this.formEl.appendChild(this.inputEl)
    this.formEl.appendChild(this.sendBtn)

    this.root.appendChild(header)
    this.root.appendChild(this.messagesEl)
    this.root.appendChild(this.statusEl)
    this.root.appendChild(this.formEl)

    document.body.appendChild(this.root)

    this.formEl.addEventListener('submit', (event) => {
      event.preventDefault()
      void this.sendMessage()
    })

    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void this.sendMessage()
      }
    })

    this.appendMessage({
      role: 'assistant',
      text: 'Hej! 👋\nStil mig et spørgsmål om vindenergi. Du kan for eksempel spørge:\n\n* Hvordan virker en vindmølle?\n* Hvor kommer strømmen fra, når det ikke blæser?\n* Hvad er fordelene og ulemperne ved vindenergi?',
    })
  }

  private appendMessage(message: ChatMessage): void {
    const row = document.createElement('div')
    row.className = `chat-message ${message.role}`
    row.textContent = message.text
    this.messagesEl.appendChild(row)
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight
  }

  private setSendingState(nextState: boolean): void {
    this.isSending = nextState
    this.sendBtn.disabled = nextState
    this.inputEl.disabled = nextState
    this.statusEl.textContent = nextState ? 'Sender...' : ''
  }

  private async sendMessage(): Promise<void> {
    if (this.isSending) {
      return
    }

    const message = this.inputEl.value.trim()
    if (!message) {
      return
    }

    this.appendMessage({ role: 'user', text: message })
    this.inputEl.value = ''
    this.setSendingState(true)

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = (await response.json()) as ChatResponse
      if (!response.ok) {
        const errorMessage = data.error || 'Der opstod en fejl i chatten.'
        this.appendMessage({ role: 'system', text: `Fejl: ${errorMessage}` })
        return
      }

      const reply = (data.reply || '').trim()
      this.appendMessage({
        role: 'assistant',
        text: reply || 'Botten returnerede et tomt svar.',
      })
    } catch (_error: unknown) {
      this.appendMessage({
        role: 'system',
        text: 'Kunne ikke kontakte backend. Er serveren startet?',
      })
    } finally {
      this.setSendingState(false)
      this.inputEl.focus()
    }
  }
}
