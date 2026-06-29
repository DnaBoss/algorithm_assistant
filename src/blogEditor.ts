import type { BlogBlock, BlogPost } from './blogData'

export function blocksToMarkdown(blocks: BlogPost['body']) {
  return blocks.map(block => {
    if (block.kind === 'heading') return `## ${block.text}`
    if (block.kind === 'quote') return `> ${block.text}`
    if (block.kind === 'list') return block.items.map(item => `- ${item}`).join('\n')
    if (block.kind === 'code') return ['```' + (block.language ?? ''), block.code, '```'].join('\n')
    return block.text
  }).join('\n\n')
}

export function markdownToBlocks(markdown: string): BlogBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: BlogBlock[] = []
  let paragraph: string[] = []
  let listItems: string[] = []
  let codeLines: string[] = []
  let codeLanguage: string | undefined
  let inCode = false

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim()
    if (text) blocks.push({ kind: 'paragraph', text })
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length > 0) blocks.push({ kind: 'list', items: listItems })
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inCode) {
        blocks.push({
          kind: 'code',
          code: codeLines.join('\n').replace(/\n+$/, ''),
          language: codeLanguage,
        })
        codeLines = []
        codeLanguage = undefined
        inCode = false
      } else {
        flushParagraph()
        flushList()
        codeLanguage = trimmed.slice(3).trim() || undefined
        inCode = true
      }
      continue
    }

    if (inCode) {
      codeLines.push(rawLine)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'heading', text: trimmed.slice(3).trim() })
      continue
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'quote', text: trimmed.slice(2).trim() })
      continue
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph()
      listItems.push(trimmed.slice(2).trim())
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  if (inCode) {
    blocks.push({
      kind: 'code',
      code: codeLines.join('\n').replace(/\n+$/, ''),
      language: codeLanguage,
    })
  }

  flushParagraph()
  flushList()

  return blocks.length > 0 ? blocks : [{ kind: 'paragraph', text: '' }]
}

export function estimateReadMinutes(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const cjkChars = (markdown.match(/[\u3400-\u9fff]/g) ?? []).length
  return Math.max(1, Math.ceil(Math.max(words / 220, cjkChars / 500)))
}
