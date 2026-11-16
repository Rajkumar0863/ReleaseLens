
export interface ReleaseFinding {
  type: string
  severity: string
  message: string
  recommendation: string
  line: number
}

export interface ReleaseReview {
  pullRequest: number
  status: string
  testsPassed: number
  testsFailed: number
  mutantsKilled: number
  mutantsSurvived: number
  findings: ReleaseFinding[]
  evidencePolicy: string
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'
).replace(/\/$/, '')

export async function fetchReleaseReview(
  pullRequest = 17,
): Promise<ReleaseReview> {
  const response = await fetch(
    `${API_BASE_URL}/api/reviews/pr${pullRequest}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to load release review: HTTP ${response.status}`,
    )
  }

  return (await response.json()) as ReleaseReview
}
