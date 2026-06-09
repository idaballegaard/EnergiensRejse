export function sanitizeReply(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')
    .replace(/\\rightarrow|\\to/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\leftrightarrow/g, '<->')
    .replace(/^\s*[*_=-]{3,}\s*$/gm, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
