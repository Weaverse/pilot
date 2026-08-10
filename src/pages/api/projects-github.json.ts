import type { APIRoute } from 'astro'
import { fetchGithubRepository } from '~/lib/github'
import { PROJECTS } from '~/lib/projects'
import { jsonHeaders } from '~/lib/runtime/shared'

export const prerender = false

export const GET: APIRoute = async () => {
  const repos = [
    ...new Set(
      PROJECTS.map((project) => project.repo).filter((repo): repo is string =>
        Boolean(repo),
      ),
    ),
  ]

  const entries = await Promise.all(
    repos.map(async (repo) => {
      const repository = await fetchGithubRepository(repo)
      return [
        repo,
        repository
          ? {
              description: repository.description,
              language: repository.languages[0]?.name ?? null,
              nameWithOwner: repository.nameWithOwner,
              pushedAt: repository.lastCommit?.committedDate ?? null,
              stargazerCount: repository.stargazerCount,
              url: repository.url,
            }
          : null,
      ]
    }),
  )

  return Response.json(Object.fromEntries(entries), {
    headers: jsonHeaders(600),
  })
}
