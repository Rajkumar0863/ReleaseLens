
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchReleaseReview, type ReleaseReview } from './services/releaseApi'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Code2,
  GitPullRequest,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
  TrendingUp,
  XCircle,
} from 'lucide-react'

type Tab = 'overview' | 'evidence' | 'recommendations'

type Evidence = {
  id: string
  title: string
  description: string
  status: 'passed' | 'warning' | 'failed'
  category: string
}

function buildEvidence(review: ReleaseReview): Evidence[] {
  const findings = review.findings ?? []
  return [
    {
      id: 'EV-001', title: 'JUnit test execution',
      description: `${review.testsPassed} passed, ${review.testsFailed} failed.`,
      status: review.testsFailed > 0 ? 'failed' : 'passed', category: 'Testing',
    },
    {
      id: 'EV-002', title: 'Mutation testing',
      description: `${review.mutantsKilled} killed mutants and ${review.mutantsSurvived} surviving mutants.`,
      status: review.mutantsSurvived > 0 ? 'warning' : 'passed', category: 'Mutation',
    },
    ...findings.map((finding, index): Evidence => ({
      id: `EV-${String(index + 3).padStart(3, '0')}`,
      title: finding.type.replaceAll('_', ' ').toLowerCase().replace(/^./, c => c.toUpperCase()),
      description: `${finding.message} (Line ${finding.line})`,
      status: finding.severity === 'REVIEW_REQUIRED' ? 'warning' : 'failed',
      category: 'Finding',
    })),
  ]
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [review, setReview] = useState<ReleaseReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    fetchReleaseReview(17)
      .then(data => { if (active) setReview(data) })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unknown API error')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])

  const evidence = review ? buildEvidence(review) : []
  const recommendations = review?.findings
    .filter(finding => finding.recommendation)
    .map(finding => ({
      priority: finding.severity === 'REVIEW_REQUIRED' ? 'High' : 'Medium',
      title: finding.type.replaceAll('_', ' ').toLowerCase().replace(/^./, c => c.toUpperCase()),
      description: finding.recommendation,
    })) ?? []
  const killed = review?.mutantsKilled ?? 0
  const survived = review?.mutantsSurvived ?? 0
  const total = killed + survived
  const score = total > 0 ? killed / total * 100 : 0
  const scoreLabel = total > 0 ? `${score.toFixed(1)}%` : 'N/A'

  const filteredEvidence = evidence.filter((item) =>
    `${item.title} ${item.description} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0c1424] p-6 lg:block">
          <div className="mb-12 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500 p-2">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ReleaseLens
              </h1>
              <p className="text-xs text-slate-400">
                Release intelligence
              </p>
            </div>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {[
              {
                id: 'overview' as Tab,
                label: 'Overview',
                icon: LayoutDashboard,
              },
              {
                id: 'evidence' as Tab,
                label: 'Evidence',
                icon: TestTube2,
              },
              {
                id: 'recommendations' as Tab,
                label: 'Recommendations',
                icon: ShieldAlert,
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                    activeTab === item.id
                      ? 'bg-indigo-500/15 font-medium text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <CircleDot size={15} />
              <span className="text-xs font-semibold">
                Demo workspace
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              PR #17 is a reproducible research fixture.
              Backend-connected research fixture; not a live GitHub pull request.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5 lg:px-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Engineering intelligence
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Release analysis
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
                {review ? 'Backend connected · fixture' : 'Fixture · disconnected'}
              </span>
              <a
                href="https://github.com/Rajkumar0863/ReleaseLens"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                GitHub ↗
              </a>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                  <GitPullRequest size={16} />
                  Pull request #17
                  <span className="text-slate-600">/</span>
                  Release assessment
                </div>

                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                  Release readiness
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Understand code-change risk using test execution,
                  mutation evidence, and actionable recommendations.
                </p>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm hover:bg-slate-800"
              >
                PR #17
                <ChevronDown size={16} />
              </button>
            </div>

            {showDetails && (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 text-sm text-slate-300">
                <p className="font-semibold text-white">
                  PR #17 — Research fixture
                </p>
                <p className="mt-2 leading-6 text-slate-400">
                  This pull request is backed by reproducible test
                  evidence in the ReleaseLens repository.
                  Metrics and findings are retrieved from the local Spring Boot API.
                </p>
              </div>
            )}

            {loading && <p role="status" className="text-sm text-indigo-300">Loading backend review…</p>}
            {error && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                <span>Backend unavailable: {error}</span>
                <button className="rounded-lg border border-rose-400/40 px-3 py-2" onClick={() => { setLoading(true); setError(null); setReview(null); setRetry(n => n + 1) }}>Retry</button>
              </div>
            )}
            {review && <p className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 size={16} />Connected to ReleaseLens API · PR #{review.pullRequest}</p>}
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Release decision" value={review?.status ?? '—'} description="Backend assessment" icon={<AlertTriangle size={21} />} accent="amber" />
              <MetricCard title="Killed mutants" value={review ? String(killed) : '—'} description="Detected by tests" icon={<CheckCircle2 size={21} />} accent="emerald" />
              <MetricCard title="Surviving mutants" value={review ? String(survived) : '—'} description="Requires investigation" icon={<XCircle size={21} />} accent="rose" />
              <MetricCard title="Mutation score" value={review ? scoreLabel : '—'} description={review ? `${killed} of ${total} mutants killed` : 'Awaiting evidence'} icon={<TrendingUp size={21} />} accent="indigo" />
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <section className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6 xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Release decision
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Evidence-based assessment for PR #17
                    </p>
                  </div>
                  <Activity className="text-indigo-400" size={21} />
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
                  <div className="flex items-start gap-4">
                    <AlertTriangle
                      className="mt-1 shrink-0 text-amber-400"
                      size={24}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-amber-300">
                        {review?.status === 'INVESTIGATE' ? 'Investigation recommended' : review ? `Release status: ${review.status}` : 'Awaiting assessment'}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {review ? (review.findings[0]?.message ?? `Backend assessment: ${review.status}`) : 'Awaiting backend assessment.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-900/80 p-5">
                    <div className="mb-3 flex items-center gap-2 text-emerald-400">
                      <ShieldCheck size={18} />
                      <span className="text-sm font-medium">
                        Detected mutations
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{review ? killed : '—'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Mutants killed by existing tests
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-900/80 p-5">
                    <div className="mb-3 flex items-center gap-2 text-rose-400">
                      <ShieldAlert size={18} />
                      <span className="text-sm font-medium">
                        Remaining risk
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{review ? survived : '—'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Surviving mutant requiring review
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6">
                <h3 className="text-lg font-semibold">
                  Mutation analysis
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Observed mutation outcomes
                </p>

                <div className="mt-8 flex items-center justify-center">
                  <div
                    className="relative flex h-44 w-44 items-center justify-center rounded-full"
                    style={{
                      background:
                        `conic-gradient(#34d399 0% ${score}%, #fb7185 ${score}% 100%)`,
                    }}
                  >
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#101a2d]">
                      <span className="text-3xl font-bold">
                        {review ? scoreLabel : '—'}
                      </span>
                      <span className="mt-1 text-xs text-slate-400">
                        Mutation score
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Killed
                    </span>
                    <span className="font-semibold">{review ? killed : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      Survived
                    </span>
                    <span className="font-semibold">{review ? survived : '—'}</span>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-800 bg-[#101a2d] p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeTab === 'recommendations'
                      ? 'Recommended actions'
                      : 'Evidence explorer'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {activeTab === 'recommendations'
                      ? 'Suggested next steps before release'
                      : 'Explore the available release evidence'}
                  </p>
                </div>

                {activeTab !== 'recommendations' && (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                    <Search size={16} className="text-slate-500" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search evidence..."
                      className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {activeTab === 'recommendations' ? (
                <div className="space-y-3">
                  {recommendations.map((item, index) => (
                    <div
                      key={item.title}
                      className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-semibold">
                            {item.title}
                          </h4>
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                            {item.priority} priority
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recommendations.length === 0 && <p className="text-sm text-slate-400">{loading ? 'Loading recommendations…' : error ? 'Recommendations unavailable.' : 'No recommendations returned by the backend.'}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvidence.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5"
                    >
                      <div
                        className={`rounded-lg p-3 ${
                          item.status === 'passed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {item.status === 'passed' ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">
                            {item.title}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {item.id}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === 'passed'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {item.status === 'passed'
                          ? 'Passed'
                          : 'Review'}
                      </span>
                    </div>
                  ))}

                  {filteredEvidence.length === 0 && (
                    <p className="py-10 text-center text-sm text-slate-400">
                      {loading ? 'Loading evidence…' : error ? 'Evidence unavailable.' : 'No matching evidence found.'}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500"
                >
                  Explore evidence
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                >
                  View recommendations
                </button>
              </div>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500">
              <span>
                ReleaseLens · Explainable release-risk intelligence
              </span>
              <span className="flex items-center gap-2">
                <Code2 size={14} />
                PR #17 research fixture · Backend-connected prototype
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
  accent: 'amber' | 'emerald' | 'rose' | 'indigo'
}) {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101a2d] p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className={`rounded-lg p-2.5 ${colors[accent]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  )
}

export default App
