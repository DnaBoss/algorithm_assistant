import { describe, expect, it } from 'vitest'
import { blocksToMarkdown, estimateReadMinutes, markdownToBlocks } from './blogEditor'

describe('blog editor markdown mapping', () => {
  it('parses headings, paragraphs, lists, quotes, and code blocks', () => {
    const blocks = markdownToBlocks([
      'Intro paragraph',
      '',
      '## Section',
      '',
      '- one',
      '- two',
      '',
      '> note',
      '',
      '```ts',
      'const value = 1',
      '```',
    ].join('\n'))

    expect(blocks).toEqual([
      { kind: 'paragraph', text: 'Intro paragraph' },
      { kind: 'heading', text: 'Section' },
      { kind: 'list', items: ['one', 'two'] },
      { kind: 'quote', text: 'note' },
      { kind: 'code', language: 'ts', code: 'const value = 1' },
    ])
  })

  it('serializes blocks back into editable markdown', () => {
    expect(blocksToMarkdown([
      { kind: 'heading', text: 'Title' },
      { kind: 'paragraph', text: 'Body' },
      { kind: 'list', items: ['a', 'b'] },
    ])).toBe('## Title\n\nBody\n\n- a\n- b')
  })

  it('estimates at least one read minute', () => {
    expect(estimateReadMinutes('短文')).toBe(1)
  })

  it('does not treat each whitespace token as a full minute', () => {
    expect(estimateReadMinutes('one two three four five six seven eight nine ten')).toBe(1)
  })
})
