export function repositorySourceLabel(
  repo: string,
  stars: number | null,
): string {
  const starCount = stars === null ? '' : `, ${stars.toLocaleString()} stars`
  return `View ${repo} source on GitHub${starCount}`
}
