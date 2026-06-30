export type PlatformAreaId = 'blog' | 'algoLab' | 'helios' | 'easyDb'

export type PlatformProgress = {
  id: PlatformAreaId
  eyebrow: string
  title: string
  status: string
  publicSurface: string
  completed: string[]
  next: string
}

export const corePlatformAreas: PlatformProgress[] = [
  {
    id: 'blog',
    eyebrow: 'BLOG',
    title: 'Blog',
    status: 'active foundation',
    publicSurface: 'Writing for study, work, research, side projects, and personal records.',
    completed: ['Blog-first home', 'Owner editor', 'Comments and reactions'],
    next: 'Moderation, richer media, and production content workflow.',
  },
  {
    id: 'algoLab',
    eyebrow: 'ALGO LAB',
    title: 'Algo Lab',
    status: 'learning surface',
    publicSurface: 'Algorithm notes, dry-runs, complete solutions, and per-problem discussion.',
    completed: ['Searchable tutorials', 'Personal notes', 'C++ / Java / JS solutions'],
    next: 'Track hierarchy, rank-point selection, moderation, and rate limits.',
  },
  {
    id: 'helios',
    eyebrow: 'HELIOS',
    title: 'Helios',
    status: 'read-only public status',
    publicSurface: 'Quant research summaries, data-quality gates, and curated platform status.',
    completed: ['Research lanes', 'Data pipeline stages', 'Private operations boundary'],
    next: 'Read-only status export before any live adapter.',
  },
  {
    id: 'easyDb',
    eyebrow: 'EASY DB',
    title: 'Easy DB',
    status: 'schema browser',
    publicSurface: 'PostgreSQL schema learning, column search, relationship hints, and query notes.',
    completed: ['Sanitized example schema', 'Column search', 'Private connection boundary'],
    next: 'Authenticated schema export and query-note publishing flow.',
  },
]

export const releaseRhythm = {
  title: 'Release rhythm',
  status: 'batch verified slices',
  summary: 'Production updates should wait for coherent feature slices, security fixes, or public content releases.',
}

export function areaCompletionCount() {
  return corePlatformAreas.reduce((sum, area) => sum + area.completed.length, 0)
}
