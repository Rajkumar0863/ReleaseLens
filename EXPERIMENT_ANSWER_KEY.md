# PR #17 independent experiment answer key

**Scenario type:** deliberately seeded, synthetic business-rule regression. No claim of real production failure.

## Predefined business rules
- PR17-R1: Payment amount is valid **iff** amount > 0.
- PR17-R2: `null` is rejected with an exception; not under investigation.

## Ground truth by input
| Input | Baseline expected/actual | PR #17 expected | PR #17 actual from source | Finding |
|---|---|---|---|---|
| `10.00` | true | true | true | correct |
| `-5.00` | false | false | false | correct |
| `0.00` | false | false | **true** | **seeded regression** |
| `0.000` | false | false | **true** | same boundary defect |

Expected/actual values above are derived by inspection of the Java source, **not execution logs**.

## Primary reviewer question
`Would you merge PR #17 as-is? State the exact evidence and next action.`

## Scoring rubric (predefined)
- **2 points:** Identifies zero-value acceptance as violating PR17-R1, cites changed `> -> >=` condition, and recommends a zero-boundary test before merge.
- **1 point:** Flags missing zero-boundary test / requires investigation but does not explicitly establish the violation.
- **0 points:** Approves as-is solely because tests pass, or reports a different ungrounded defect without flagging zero.
- Separately log review time in seconds, confidence (1–5), and false-safe decision (yes/no). Do not conflate confidence with correctness.

## Expected behavior (hypotheses, not results)
1. Default tests should pass in both versions.
2. Explicit `BoundaryOracle` should pass in baseline and fail in pr-change.
3. PIT may produce a surviving boundary mutant; mutation score is **unknown** until run.
4. Mutation survival alone is evidence of test insensitivity, not proof of violation; the stipulated requirement and comparison operator establish the defect.

## Confounders and design limitations
- Reviewer can spot the defect directly from the one-line diff; this is intentionally a **teaching/smoke-test** scenario, not a challenging primary study case.
- Participants familiar with mutation testing may have an advantage; record prior experience.
- Use harder, matched scenarios for the primary study and have the ground truth reviewed independently.
- Present identical evidence across A/B if testing explanation quality; otherwise state that the experiment tests an evidence-and-UI bundle.
- Small sample sizes warrant descriptive reporting only; do not infer statistical significance.
