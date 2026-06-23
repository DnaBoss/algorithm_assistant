import type { Tutorial } from './tutorialData'

export const problemNumbers: Record<string, number> = {
  'two-sum': 1,
  'add-two-numbers': 2,
  'longest-substring-without-repeating-characters': 3,
  'longest-palindromic-substring': 5,
  'zigzag-conversion': 6,
  'palindrome-number': 9,
  'container-with-most-water': 11,
  'integer-to-roman': 12,
  'roman-to-integer': 13,
  'longest-common-prefix': 14,
  'three-sum': 15,
  'letter-combinations-of-a-phone-number': 17,
  'remove-nth-node-from-end-of-list': 19,
  'valid-parentheses': 20,
  'merge-two-sorted-lists': 21,
  'generate-parentheses': 22,
  'merge-k-sorted-lists': 23,
  'reverse-nodes-in-k-group': 25,
  'remove-duplicates-from-sorted-array': 26,
  'remove-element': 27,
  'find-the-index-of-the-first-occurrence-in-a-string': 28,
  'search-in-rotated-sorted-array': 33,
  'search-insert-position': 35,
  'combination-sum': 39,
  'trapping-rain-water': 42,
  'permutations': 46,
  'rotate-image': 48,
  'group-anagrams': 49,
  'powx-n': 50,
  'n-queens-ii': 52,
  'maximum-subarray': 53,
  'spiral-matrix': 54,
  'jump-game': 55,
  'merge-intervals': 56,
  'insert-interval': 57,
  'length-of-last-word': 58,
  'rotate-list': 61,
  'unique-paths': 62,
  'minimum-path-sum': 64,
  'plus-one': 66,
  'add-binary': 67,
  'text-justification': 68,
  'sqrtx': 69,
  'climbing-stairs': 70,
  'simplify-path': 71,
  'edit-distance': 72,
  'set-matrix-zeroes': 73,
  'search-a-2d-matrix': 74,
  'minimum-window-substring': 76,
  'combinations': 77,
  'subsets': 78,
  'word-search': 79,
  'remove-duplicates-from-sorted-array-ii': 80,
  'remove-duplicates-from-sorted-list-ii': 82,
  'partition-list': 86,
  'merge-sorted-array': 88,
  'decode-ways': 91,
  'validate-binary-search-tree': 98,
  'same-tree': 100,
  'symmetric-tree': 101,
  'binary-tree-level-order-traversal': 102,
  'maximum-depth-of-binary-tree': 104,
  'construct-binary-tree-from-preorder-and-inorder-traversal': 105,
  'path-sum': 112,
  'flatten-binary-tree-to-linked-list': 114,
  'populating-next-right-pointers-in-each-node-ii': 117,
  'triangle': 120,
  'best-time-to-buy-and-sell-stock': 121,
  'best-time-to-buy-and-sell-stock-ii': 122,
  'binary-tree-maximum-path-sum': 124,
  'valid-palindrome': 125,
  'word-ladder': 127,
  'longest-consecutive-sequence': 128,
  'surrounded-regions': 130,
  'clone-graph': 133,
  'gas-station': 134,
  'candy': 135,
  'single-number': 136,
  'copy-list-with-random-pointer': 138,
  'word-break': 139,
  'linked-list-cycle': 141,
  'reorder-list': 143,
  'lru-cache': 146,
  'sort-list': 148,
  'max-points-on-a-line': 149,
  'evaluate-reverse-polish-notation': 150,
  'reverse-words-in-a-string': 151,
  'maximum-product-subarray': 152,
  'find-minimum-in-rotated-sorted-array': 153,
  'min-stack': 155,
  'find-peak-element': 162,
  'two-sum-ii-input-array-is-sorted': 167,
  'majority-element': 169,
  'factorial-trailing-zeroes': 172,
  'rotate-array': 189,
  'reverse-bits': 190,
  'number-of-1-bits': 191,
  'house-robber': 198,
  'binary-tree-right-side-view': 199,
  'number-of-islands': 200,
  'bitwise-and-of-numbers-range': 201,
  'happy-number': 202,
  'isomorphic-strings': 205,
  'reverse-linked-list': 206,
  'course-schedule': 207,
  'implement-trie-prefix-tree': 208,
  'minimum-size-subarray-sum': 209,
  'course-schedule-ii': 210,
  'add-and-search-word': 211,
  'word-search-ii': 212,
  'house-robber-ii': 213,
  'contains-duplicate': 217,
  'contains-duplicate-ii': 219,
  'count-complete-tree-nodes': 222,
  'basic-calculator': 224,
  'invert-binary-tree': 226,
  'summary-ranges': 228,
  'kth-smallest-element-in-a-bst': 230,
  'lowest-common-ancestor-of-a-bst': 235,
  'product-of-array-except-self': 238,
  'valid-anagram': 242,
  'meeting-rooms': 252,
  'meeting-rooms-ii': 253,
  'graph-valid-tree': 261,
  'missing-number': 268,
  'alien-dictionary': 269,
  'encode-and-decode-strings': 271,
  'h-index': 274,
  'game-of-life': 289,
  'word-pattern': 290,
  'find-median-from-data-stream': 295,
  'serialize-and-deserialize-binary-tree': 297,
  'longest-increasing-subsequence': 300,
  'coin-change': 322,
  'number-of-connected-components': 323,
  'counting-bits': 338,
  'top-k-frequent-elements': 347,
  'sum-of-two-integers': 371,
  'combination-sum-iv': 377,
  'insert-delete-getrandom-o1': 380,
  'ransom-note': 383,
  'evaluate-division': 399,
  'pacific-atlantic-water-flow': 417,
  'longest-repeating-character-replacement': 424,
  'minimum-genetic-mutation': 433,
  'non-overlapping-intervals': 435,
  'subtree-of-another-tree': 572,
  'palindromic-substrings': 647,
  'average-of-levels-in-binary-tree': 637,
  'snakes-and-ladders': 909,
  'longest-common-subsequence': 1143
}

export function problemNumberFor(id: string): number | undefined {
  return problemNumbers[id]
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function subsequenceScore(query: string, target: string): number {
  let qi = 0
  let score = 0
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (query[qi] === target[ti]) { qi++; score += 2 }
  }
  return qi === query.length ? score / Math.max(target.length, 1) : 0
}

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  const cur = Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev.splice(0, prev.length, ...cur)
  }
  return prev[b.length]
}

function tokenMatchScore(query: string, target: string): number {
  const qTokens = query.split(' ').filter(Boolean)
  const tTokens = target.split(' ').filter(Boolean)
  if (!qTokens.length || !tTokens.length) return 0
  let total = 0
  for (const q of qTokens) {
    let best = 0
    for (const t of tTokens) {
      if (t === q) best = Math.max(best, 1)
      else if (t.startsWith(q) || q.startsWith(t)) best = Math.max(best, 0.9)
      else best = Math.max(best, 1 - editDistance(q, t) / Math.max(q.length, t.length))
    }
    if (best < 0.58) return 0
    total += best
  }
  return 620 * (total / qTokens.length)
}

export function searchTutorials(tutorials: Tutorial[], query: string): Tutorial[] {
  const q = normalize(query)
  if (!q) return tutorials
  const numeric = q.match(/^#?(\d+)$/)?.[1]
  if (numeric) return tutorials.filter(t => String(problemNumberFor(t.id)) === numeric)
  const scored = tutorials.map(t => {
    const number = problemNumberFor(t.id)
    if (numeric && String(number) === numeric) return { t, score: 1000 }
    const baseHaystacks = [t.title, t.id.replaceAll('-', ' '), t.group, ...t.tags, number ? String(number) : '']
    const haystacks = [...baseHaystacks, baseHaystacks.join(' ')].map(normalize)
    let score = 0
    for (const h of haystacks) {
      if (!h) continue
      if (h === q) score = Math.max(score, 900)
      else if (h.includes(q)) score = Math.max(score, 700 + q.length / h.length)
      else {
        const dist = editDistance(q, h)
        const similarity = 1 - dist / Math.max(q.length, h.length)
        score = Math.max(score, similarity * 500, subsequenceScore(q, h) * 350, tokenMatchScore(q, h))
      }
    }
    return { t, score }
  }).filter(x => x.score >= 260)
  return scored.sort((a, b) => b.score - a.score || (problemNumberFor(a.t.id) ?? 9999) - (problemNumberFor(b.t.id) ?? 9999)).map(x => x.t)
}
