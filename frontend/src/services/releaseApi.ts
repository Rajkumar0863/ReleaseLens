
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

export async function fetchReleaseReview(
  pullRequest = 17,
): Promise<ReleaseReview> {
  const response = await fetch(
    `/api/reviews/pr${pullRequest}`,
    {
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
