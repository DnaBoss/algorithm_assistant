import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

const tutorials = mod.tutorials
const ids = tutorials.map(t => t.id)
const titles = new Set(tutorials.map(t => t.title))
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i)
const top150 = tutorials.filter(t => t.tags.includes('Top 150') || t.tags.includes('LeetCode Top 150'))
const blind75 = tutorials.filter(t => t.tags.includes('Blind 75'))
const requiredTitles = [
  'Merge Sorted Array', 'Remove Element', 'Remove Duplicates from Sorted Array', 'Majority Element', 'Rotate Array',
  'Best Time to Buy and Sell Stock II', 'H-Index', 'Insert Delete GetRandom O(1)', 'Gas Station', 'Candy',
  'Trapping Rain Water', 'Roman to Integer', 'Integer to Roman', 'Length of Last Word', 'Longest Common Prefix',
  'Reverse Words in a String', 'Zigzag Conversion', 'Find the Index of the First Occurrence in a String', 'Text Justification',
  'Ransom Note', 'Isomorphic Strings', 'Word Pattern', 'Happy Number', 'Plus One', 'Sqrt(x)',
  'Add Binary', 'Reverse Nodes in k-Group', 'Partition List', 'LRU Cache', 'Minimum Size Subarray Sum',
  'Two Sum II - Input Array Is Sorted', 'Contains Duplicate II', 'Summary Ranges', 'Min Stack', 'Evaluate Reverse Polish Notation',
  'Basic Calculator', 'Simplify Path', 'Game of Life', 'Surrounded Regions', 'Snakes and Ladders',
  'Minimum Genetic Mutation', 'Word Ladder', 'Average of Levels in Binary Tree', 'Symmetric Tree', 'Path Sum',
  'Count Complete Tree Nodes', 'Binary Tree Right Side View', 'Flatten Binary Tree to Linked List', 'Populating Next Right Pointers in Each Node II',
  'Search Insert Position', 'Find Peak Element', 'Search a 2D Matrix', 'Sort List', 'Min Stack', 'Edit Distance'
]
const missing = requiredTitles.filter(t => !titles.has(t))
if (tutorials.length !== 150) throw new Error(`Top 150 catalog must contain exactly 150 tutorials; found ${tutorials.length}`)
if (top150.length !== 150) throw new Error(`Every tutorial must be tagged Top 150; found ${top150.length}`)
if (blind75.length !== 75) throw new Error(`Blind 75 subset must remain 75; found ${blind75.length}`)
if (duplicateIds.length) throw new Error(`Duplicate tutorial ids: ${duplicateIds.join(', ')}`)
if (missing.length) throw new Error(`Missing required Top 150 titles:\n${missing.join('\n')}`)
console.log('Top 150 catalog check passed: 150 tutorials, 75 Blind subset, required titles present, no duplicate IDs')
