// @ts-nocheck -- Bun's test globals are not part of the Astro app tsconfig.
import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import BuildLog from './BuildLog'
import HomeSourceFooter from './HomeSourceFooter'
import { repositorySourceLabel } from './repository-link'

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

  test('renders a personal homepage source CTA with conversion tracking', () => {
    const html = renderToStaticMarkup(
      <HomeSourceFooter repo={REPO} repoUrl={REPO_URL} />,
    )

    expect(html).toContain('handwritten signature')
    expect(html).toContain('built by Leo Huynh in Hanoi')
    expect(html).toContain('View source on GitHub')
    expect(html).toContain(`href="${REPO_URL}"`)
    expect(html).toContain('data-umami-event="homepage-view-repo"')
    expect(html).toContain('data-umami-event-source="closing-block"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
  })
})
