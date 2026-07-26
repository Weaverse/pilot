// @ts-nocheck -- Bun's test globals are not part of the Astro app tsconfig.
import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import BuildLog from './BuildLog'
import { repositorySourceLabel } from './repository-link'
import StatusRepository from './StatusRepository'

const REPO = 'hta218/leohuynh.dev'
const REPO_URL = 'https://github.com/hta218/leohuynh.dev'

describe('repository discovery links', () => {
  test('includes a resolved star count in the accessible link label', () => {
    expect(repositorySourceLabel(REPO, 380)).toBe(
      `View ${REPO} source on GitHub, 380 stars`,
    )
    expect(repositorySourceLabel(REPO, null)).toBe(
      `View ${REPO} source on GitHub`,
    )
  })

  test('links the Build Log repository and star values to GitHub', () => {
    const html = renderToStaticMarkup(
      <BuildLog
        site="leohuynh.dev"
        description="documenting the work, one note at a time"
        repo={REPO}
        repoUrl={REPO_URL}
        loc={123}
        files={12}
        stack={['astro', 'bun']}
      />,
    )

    expect(html).toContain(`href="${REPO_URL}"`)
    expect(html).toContain('data-umami-event="build-log-view-repo"')
    expect(html).toContain('data-umami-event-target="repo"')
    expect(html).toContain('data-umami-event-target="stars"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })

  test('renders a compact status-bar repository identity with conversion tracking', () => {
    const html = renderToStaticMarkup(
      <StatusRepository repo={REPO} repoUrl={REPO_URL} />,
    )

    expect(html).toContain('leo@[::1]:443')
    expect(html).not.toContain('leo@[::1]:443~/')
    expect(html).toContain('>~/</span><a')
    expect(html).toContain(REPO)
    expect(html).toContain('(stargazers: —)')
    expect(html.match(/<svg/g)).toHaveLength(1)
    expect(html).not.toContain('handwritten signature')
    expect(html).not.toContain('Source code')
    expect(html).not.toContain('★')
    expect(html).toContain(`href="${REPO_URL}"`)
    expect(html).toContain('data-umami-event="statusbar-view-repo"')
    expect(html).toContain('data-umami-event-source="studio-statusbar"')
    expect(html).not.toContain('homepage-view-repo')
    expect(html).not.toContain('sidebar-view-repo')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })
})
