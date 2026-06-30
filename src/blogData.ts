export type BlogStatus = 'draft' | 'published'

export type BlogBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; code: string; language?: string }
  | { kind: 'quote'; text: string }
  | { kind: 'video'; url: string; title?: string }

export type BlogPost = {
  id: string
  slug: string
  status: BlogStatus
  title: string
  excerpt: string
  category: string
  tags: string[]
  date: string
  updatedAt: string
  readMinutes: number
  body: BlogBlock[]
}

export const blogPosts: BlogPost[] = []

export const publishedBlogPosts = blogPosts
  .filter(post => post.status === 'published')
  .sort((left, right) => right.date.localeCompare(left.date))

export function blogCategories(posts: BlogPost[] = publishedBlogPosts) {
  return Array.from(new Set(posts.map(post => post.category))).sort()
}

export function blogTags(posts: BlogPost[] = publishedBlogPosts) {
  return Array.from(new Set(posts.flatMap(post => post.tags))).sort()
}

export function searchBlogPosts(posts: BlogPost[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return posts

  return posts.filter(post => {
    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      post.slug,
      ...post.tags,
      ...post.body.flatMap(block => {
        if (block.kind === 'list') return block.items
        if (block.kind === 'code') return [block.code]
        if (block.kind === 'video') return [block.title ?? '', block.url]
        return [block.text]
      }),
    ].join(' ').toLowerCase()

    return haystack.includes(normalized)
  })
}
