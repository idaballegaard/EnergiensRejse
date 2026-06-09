type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  text: string
}

type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatResponse = {
  reply?: string
  error?: string
}

const DEFAULT_CHAT_API_URL = 'http://localhost:8787/api/chat'
const MAX_HISTORY_MESSAGES = 14

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInlineMarkdown(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
}

function renderMessageMarkdown(input: string): string {
  const escaped = escapeHtml(input)
  const lines = escaped.split(/\r?\n/)
  const htmlParts: string[] = []
  let paragraphBuffer: string[] = []
  let inUl = false
  let inOl = false

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    htmlParts.push(`<p>${renderInlineMarkdown(paragraphBuffer.join(' '))}</p>`)
    paragraphBuffer = []
  }

  const closeLists = () => {
    if (inUl) {
      htmlParts.push('</ul>')
      inUl = false
    }
    if (inOl) {
      htmlParts.push('</ol>')
      inOl = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      closeLists()
      continue
    }

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      closeLists()
      const headingText = headingMatch[1] ?? ''
      htmlParts.push(`<h3>${renderInlineMarkdown(headingText)}</h3>`)
      continue
    }

    const ulMatch = line.match(/^[-*]\s+(.+)$/)
    if (ulMatch) {
      flushParagraph()
      if (inOl) {
        htmlParts.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        htmlParts.push('<ul>')
        inUl = true
      }
      const bulletText = ulMatch[1] ?? ''
      htmlParts.push(`<li>${renderInlineMarkdown(bulletText)}</li>`)
      continue
    }

    const olMatch = line.match(/^\d+\.\s+(.+)$/)
    if (olMatch) {
      flushParagraph()
      if (inUl) {
        htmlParts.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        htmlParts.push('<ol>')
        inOl = true
      }
      const numberedText = olMatch[1] ?? ''
      htmlParts.push(`<li>${renderInlineMarkdown(numberedText)}</li>`)
      continue
    }

    if (inUl || inOl) {
      closeLists()
    }
    paragraphBuffer.push(line)
  }

  flushParagraph()
  closeLists()

  return htmlParts.join('')
}

export default class ChatPanel {
  private root: HTMLElement
  private messagesEl: HTMLDivElement
  private formEl: HTMLFormElement
  private inputEl: HTMLTextAreaElement
  private sendBtn: HTMLButtonElement
  private statusEl: HTMLParagraphElement
  private apiUrl: string
  private isSending = false
  private conversation: ChatHistoryMessage[] = []

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

    const welcomeMessage =
      'Hej! 👋\nStil mig et spørgsmål om vindenergi. Du kan for eksempel spørge:\n\n* Hvordan virker en vindmølle?\n* Hvor kommer strømmen fra, når det ikke blæser?\n* Hvad er fordelene og ulemperne ved vindenergi?'

    this.appendMessage({
      role: 'assistant',
      text: welcomeMessage,
    })
    this.conversation.push({ role: 'assistant', content: welcomeMessage })
  }

  private appendMessage(message: ChatMessage, alignTop = false): void {
    const row = document.createElement('div')
    row.className = `chat-message ${message.role}`
    if (message.role === 'assistant' || message.role === 'system') {
      row.innerHTML = renderMessageMarkdown(message.text)
    } else {
      row.textContent = message.text
    }
    this.messagesEl.appendChild(row)

    if (alignTop) {
      const rowTopInContainer = row.offsetTop - this.messagesEl.offsetTop
      this.messagesEl.scrollTop = Math.max(rowTopInContainer - 8, 0)
      return
    }

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
    this.conversation.push({ role: 'user', content: message })
    this.inputEl.value = ''
    this.setSendingState(true)

    try {
      const history = this.conversation.slice(-MAX_HISTORY_MESSAGES)
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      })

      const data = (await response.json()) as ChatResponse
      if (!response.ok) {
        const errorMessage = data.error || 'Der opstod en fejl i chatten.'
        this.appendMessage({ role: 'system', text: `Fejl: ${errorMessage}` })
        return
      }

      const reply = (data.reply || '').trim()
      const assistantReply = reply || 'Botten returnerede et tomt svar.'
      this.appendMessage(
        {
        role: 'assistant',
        text: assistantReply,
      },
        true
      )
      this.conversation.push({ role: 'assistant', content: assistantReply })
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
