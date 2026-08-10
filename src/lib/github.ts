import { githubGraphql } from '~/lib/runtime/github/client'

export interface GithubRepositoryCommit {
  id: string
  abbreviatedOid: string
  committedDate: string
  message: string
  url: string
  status?: {
    state?: string
  }
}

export interface GithubRepository {
  stargazerCount: number
  description: string
  homepageUrl: string
  languages: Array<{
    color?: string
    name: string
  }>
  name: string
  nameWithOwner: string
  url: string
  forkCount: number
  repositoryTopics: string[]
  lastCommit?: GithubRepositoryCommit
  owner: {
    avatarUrl: string
    login: string
    url: string
  }
}

export async function fetchGithubRepository(
  repo: string | undefined,
): Promise<GithubRepository | null> {
  if (!repo) return null

  try {
    type GraphqlResponse = {
      repository?: {
        stargazerCount: number
        description: string
        homepageUrl: string
        owner: { avatarUrl: string; login: string; url: string }
        defaultBranchRef?: {
          target?: {
            history?: {
              edges: Array<{
                node: GithubRepositoryCommit
              }>
            }
          }
        }
        languages: {
          edges: Array<{
            node: { color?: string; name: string }
          }>
        }
        name: string
        nameWithOwner: string
        url: string
        forkCount: number
        repositoryTopics: {
          edges: Array<{
            node: { topic: { name: string } }
          }>
        }
      }
    }

    const [owner, name] = repo.split('/')
    if (!owner || !name) return null

    const data = await githubGraphql<GraphqlResponse>(
      `query Repository($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          stargazerCount
          description
          homepageUrl
          owner { avatarUrl login url }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1) {
                  edges {
                    node {
                      id
                      abbreviatedOid
                      committedDate
                      message
                      url
                      status { state }
                    }
                  }
                }
              }
            }
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { node { color name } }
          }
          name
          nameWithOwner
          url
          forkCount
          repositoryTopics(first: 20) {
            edges { node { topic { name } } }
          }
        }
      }`,
      { owner, repo: name },
    )

    const repository = data.repository
    if (!repository) return null

    return {
      ...repository,
      lastCommit:
        repository.defaultBranchRef?.target?.history?.edges?.[0]?.node,
      languages: repository.languages.edges.map((edge) => edge.node),
      repositoryTopics: repository.repositoryTopics.edges.map(
        (edge) => edge.node.topic.name,
      ),
    }
  } catch (error) {
    console.warn(
      `[projects] failed to fetch GitHub repo data for ${repo}: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    )
    return null
  }
}
