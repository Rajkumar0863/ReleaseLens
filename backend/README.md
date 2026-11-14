# ReleaseLens Evidence Engine v0.1

Copy the **contents** of the `backend` folder into your existing
`E:\Projects\ReleaseLens_PR17_Fixture\backend` folder.
Do not overwrite the `baseline`, `pr-change`, or `evidence` folders.

## Run (PowerShell)

```powershell
$env:JAVA_HOME = "C:\path\to\jdk-25"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd "E:\Projects\ReleaseLens_PR17_Fixture\backend"
mvn clean test
mvn spring-boot:run
```

In a **second terminal**:

```powershell
Invoke-RestMethod http://localhost:8080/api/reviews/pr17 | ConvertTo-Json -Depth 8
```

## Design limitations

- The API uses the actual preserved `mutations.xml`, `ordinary-tests.xml` and `PR17.diff`.
- The boundary oracle is **never** read to generate a warning.
- Diff correlation uses changed line numbers with a provisional +/-1 line proximity.
  Verify source mapping before treating this as an exact-line match.
- The fixture currently includes one Java file. Multi-file diffs, renamed files,
  and overlapping hunks need additional handling before production use.
- No claim of confirmed defect is made from a surviving mutant alone.
- This backend is not yet executed in the user's local Java/Maven environment.
