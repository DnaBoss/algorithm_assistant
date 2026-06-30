import { publishedBlogPosts, type BlogPost, type BlogStatus } from './blogData'

export type BlogPostPayload = {
  slug?: string
  status: BlogStatus
  title: string
  excerpt: string
  category: string
  tags: string[]
  readMinutes: number
  body: BlogPost['body']
}

export type AdminSecurity = {
  email: string
  displayName: string
  totpEnabled: boolean
  passwordChangedAt?: string
}

export type TotpSetup = {
  secret: string
  otpauthUrl: string
}

export type BlogComment = {
  id: string
  displayName: string
  body: string
  createdAt: string
}

export type BlogReactionType = 'like' | 'useful' | 'inspired' | 'thoughtful'

export type BlogReactionSummary = {
  reactionType: BlogReactionType
  count: number
  reacted: boolean
}

export type BlogInteractions = {
  comments: BlogComment[]
  reactions: BlogReactionSummary[]
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function fetchPublishedPosts() {
  try {
    const data = await requestJson<{ posts: BlogPost[] }>('/api/blog/posts')
    return data.posts
  } catch {
    return publishedBlogPosts
  }
}

export async function fetchBlogInteractions(slug: string, anonymousKey: string) {
  const params = new URLSearchParams({ anonymousKey })
  return requestJson<BlogInteractions>(`/api/blog/posts/${encodeURIComponent(slug)}/interactions?${params}`)
}

export async function createBlogComment(slug: string, displayName: string, body: string) {
  return requestJson<BlogInteractions>(`/api/blog/posts/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ displayName, body }),
  })
}

export async function createBlogReaction(slug: string, reactionType: BlogReactionType, anonymousKey: string) {
  return requestJson<BlogInteractions>(`/api/blog/posts/${encodeURIComponent(slug)}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ reactionType, anonymousKey }),
  })
}

export async function adminLogin(email: string, password: string, totpCode?: string) {
  const data = await requestJson<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, totpCode }),
  })
  return data.token
}

export async function fetchAdminSecurity(token: string) {
  return requestJson<AdminSecurity>('/api/admin/security', {
    headers: { authorization: `Bearer ${token}` },
  })
}

export async function changeAdminPassword(token: string, currentPassword: string, newPassword: string) {
  await requestJson<void>('/api/admin/password', {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function setupAdminTotp(token: string) {
  return requestJson<TotpSetup>('/api/admin/totp/setup', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })
}

export async function enableAdminTotp(token: string, code: string) {
  await requestJson<void>('/api/admin/totp/enable', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  })
}

export async function disableAdminTotp(token: string, password: string, code?: string) {
  await requestJson<void>('/api/admin/totp/disable', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ password, code }),
  })
}

export async function fetchAdminPosts(token: string) {
  const data = await requestJson<{ posts: BlogPost[] }>('/api/admin/posts', {
    headers: { authorization: `Bearer ${token}` },
  })
  return data.posts
}

export async function saveAdminPost(token: string, payload: BlogPostPayload, id?: string) {
  const data = await requestJson<{ post: BlogPost }>(id ? `/api/admin/posts/${id}` : '/api/admin/posts', {
    method: id ? 'PUT' : 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  return data.post
}

export async function deleteAdminPost(token: string, id: string) {
  await requestJson<void>(`/api/admin/posts/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  })
}
