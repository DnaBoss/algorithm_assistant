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
    completed: ['Blog-first home', 'Owner editor', 'Comments and reactions', 'Public rate limit', 'Moderation tools'],
    next: 'Richer media, bulk moderation, and production content workflow.',
  },
  {
    id: 'algoLab',
    eyebrow: 'ALGO LAB',
    title: 'Algo Lab',
    status: 'learning surface',
    publicSurface: 'Algorithm notes, dry-runs, complete solutions, and per-problem discussion.',
    completed: ['Searchable tutorials', 'Track hierarchy', 'Rating selection', 'Public rate limit', 'Moderation tools'],
    next: 'Deeper per-track study plans and progress markers.',
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
  summary: 'Run npm run release:gate first; deploy only coherent feature slices, security fixes, or public content releases.',
}

export function areaCompletionCount() {
  return corePlatformAreas.reduce((sum, area) => sum + area.completed.length, 0)
}
