import { env } from '~/lib/runtime/shared'

export interface GiscusConfig {
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  reactionsEnabled: '0' | '1'
  emitMetadata: '0' | '1'
  inputPosition: 'top' | 'bottom'
  theme: string
  lang: string
}

export function getGiscusConfig(): GiscusConfig | null {
  const repo = env('PUBLIC_GISCUS_REPO')
  const repoId = env('PUBLIC_GISCUS_REPOSITORY_ID')
  const category = env('PUBLIC_GISCUS_CATEGORY')
  const categoryId = env('PUBLIC_GISCUS_CATEGORY_ID')

  if (!repo || !repoId || !category || !categoryId || !repo.includes('/')) {
    return null
  }

  return {
    repo: repo as `${string}/${string}`,
    repoId,
    category,
    categoryId,
    mapping: 'title',
    reactionsEnabled: '0',
    emitMetadata: '0',
    inputPosition: 'bottom',
    theme: 'light',
    lang: 'en',
  }
}
