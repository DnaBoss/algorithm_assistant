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

export async function adminLogin(email: string, password: string) {
  const data = await requestJson<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.token
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
