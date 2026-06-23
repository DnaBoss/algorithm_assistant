import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const catalogSource = source.slice(source.indexOf('const rawTutorials'), source.indexOf('export const tutorials'))
const ids = [...catalogSource.matchAll(/^\s*\{ id: '([^']+)'/gm)].map(match => match[1])
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)

const requiredTitles = [
  'Two Sum','Best Time to Buy and Sell Stock','Contains Duplicate','Product of Array Except Self','Maximum Subarray','Maximum Product Subarray','Find Minimum in Rotated Sorted Array','Search in Rotated Sorted Array','3Sum','Container With Most Water',
  'Sum of Two Integers','Number of 1 Bits','Counting Bits','Missing Number','Reverse Bits',
  'Climbing Stairs','Coin Change','Longest Increasing Subsequence','Longest Common Subsequence','Word Break','Combination Sum IV','House Robber','House Robber II','Decode Ways','Unique Paths','Jump Game',
  'Clone Graph','Course Schedule','Pacific Atlantic Water Flow','Number of Islands','Longest Consecutive Sequence','Alien Dictionary','Graph Valid Tree','Number of Connected Components in an Undirected Graph',
  'Insert Interval','Merge Intervals','Non-overlapping Intervals','Meeting Rooms','Meeting Rooms II',
  'Reverse Linked List','Linked List Cycle','Merge Two Sorted Lists','Merge K Sorted Lists','Remove Nth Node From End of List','Reorder List',
  'Set Matrix Zeroes','Spiral Matrix','Rotate Image','Word Search',
  'Longest Substring Without Repeating Characters','Longest Repeating Character Replacement','Minimum Window Substring','Valid Anagram','Group Anagrams','Valid Parentheses','Valid Palindrome','Longest Palindromic Substring','Palindromic Substrings','Encode and Decode Strings',
  'Maximum Depth of Binary Tree','Same Tree','Invert Binary Tree','Binary Tree Maximum Path Sum','Binary Tree Level Order Traversal','Serialize and Deserialize Binary Tree','Subtree of Another Tree','Construct Binary Tree from Preorder and Inorder Traversal','Validate Binary Search Tree','Kth Smallest Element in a BST','Lowest Common Ancestor of a BST','Implement Trie (Prefix Tree)','Add and Search Word','Word Search II',
  'Top K Frequent Elements','Find Median from Data Stream'
]

const missingTitles = requiredTitles.filter(title => !source.includes(`title: '${title}'`))

if (!source.includes('export const tutorials')) throw new Error('tutorialData.ts must export tutorials')
if (ids.length !== 75) throw new Error(`Expected 75 tutorials, found ${ids.length}`)
if (duplicateIds.length) throw new Error(`Duplicate tutorial ids: ${duplicateIds.join(', ')}`)
if (missingTitles.length) throw new Error(`Missing required Blind 75 titles: ${missingTitles.join(', ')}`)
if (!source.includes("'Blind 75'")) throw new Error('Tutorials must include Blind 75 tags')

console.log(`Blind 75 content check passed: ${ids.length} tutorials`)
