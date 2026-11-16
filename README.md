# ReleaseLens PR #17 — reproducible research fixture

## Research question
Can a reviewer identify a zero-boundary regression when the existing positive/negative tests pass? Does mutation evidence improve review decisions?

## Ground truth
PR17-R1 (stipulated for this synthetic exercise): only strictly positive payment amounts are valid. `null` throws `NullPointerException` in both versions; null handling is outside this experiment.

- `baseline/`: `amount.compareTo(BigDecimal.ZERO) > 0` — complies with PR17-R1.
- `pr-change/`: `amount.compareTo(BigDecimal.ZERO) >= 0` — violates PR17-R1 for zero.
- Both contain the **same** two intentionally incomplete JUnit tests (positive and negative).
- `BoundaryOracle.java` is **not discovered by default** by Surefire because its class name does not match the standard `*Test` naming convention. It is an independently specified test to run explicitly **after** baseline measurements.

## Prerequisites
JDK 25 (the latest LTS) and Apache Maven 3.9+. The backend and both fixture builds target Java 25. Maven plugins/dependencies need network access on first execution.

## Run (PowerShell or Bash)
```sh
cd baseline
mvn clean verify
mvn org.pitest:pitest-maven:mutationCoverage
cd ../pr-change
mvn clean verify
mvn org.pitest:pitest-maven:mutationCoverage
```

JUnit XML: `target/surefire-reports/`; JaCoCo HTML: `target/site/jacoco/index.html`; PIT XML: `target/pit-reports/mutations.xml`; PIT HTML: `target/pit-reports/index.html`. Report layout may depend on plugin version.

Run the oracle separately **after** capturing the ordinary test and PIT reports:
```sh
# in baseline or pr-change
mvn -Dtest=BoundaryOracle test
```
On PowerShell, if argument parsing causes issues: `mvn "-Dtest=BoundaryOracle" test`.

Expected logic (not executed evidence):
- Ordinary two JUnit tests should pass in both versions.
- The zero oracle should pass in baseline and fail in pr-change.
- PIT's `CONDITIONALS_BOUNDARY` may mutate `>=` to `>` in pr-change; this mutant should survive with only the ordinary two tests. Inspect `mutations.xml` rather than presuming a particular generated mutant or overall score.
- JaCoCo line coverage may be high or 100% for the method even though zero is untested. Inspect the actual report; do not assume a percentage.

## Research safeguards
1. State PR17-R1 to evaluators; otherwise the zero case is not necessarily a defect.
2. Randomize/counterbalance which report condition each reviewer sees first.
3. Compare equivalent underlying evidence; if treatment includes PIT but baseline does not, attribute any effect to **extra evidence plus presentation**, not to presentation alone.
4. Do not interpret surviving mutants as proof of real-world bugs. Equivalent mutants and test-design limitations matter.
5. Never invent observed scores, runtimes, participant counts or interview findings.

## Suggested condition design
- A: JUnit + JaCoCo + raw PIT XML/HTML (same underlying evidence).
- B: JUnit + JaCoCo + same PIT evidence summarized into actionable, source-linked ReleaseLens explanations.
This isolates the value of synthesis/presentation better than withholding PIT entirely from A.

## Analysis rubric
See `EXPERIMENT_ANSWER_KEY.md` for independent truth labels and scoring.
