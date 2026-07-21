# UniDB Database Schema

PostgreSQL database for storing university and department data.

## Tables

### `universities`
Core information for each university — name, location, website, and classification.

- `unit_id` — College Scorecard's unique institution identifier (`UNITID`), used for upsert conflict detection
- `sector_type` is one of: `public`, `private_nonprofit`, `private_forprofit`

### `university_undergrad_stats`
One row per university. Contains undergraduate-level statistics with paired percentile columns (e.g. `graduation_rate` + `graduation_rate_percentile`). Includes SAT/ACT scores which are undergrad-only.

- `graduation_rate` — 4-year completion rate at 150% of normal time, using `C150_4_POOLED` (2-year rolling average) for stability
- `graduation_rate_extended` — 4-year completion rate at 200% of normal time, using `C200_4_POOLED` (captures slower completers)
- `graduation_rate_reliable` — `false` when the Scorecard suppresses the data due to small sample size (n<30)

### `university_grad_stats`
Same structure as undergrad stats but without SAT/ACT fields. Separate table because the two modes have different column sets. Shares the same graduation rate columns as undergrad (institution-level metrics).

### `university_undergrad_demographics`
One row per university. Stores undergraduate gender, ethnicity, and income breakdowns as JSONB arrays of `{"name": "...", "value": N}` objects. Percentage values are stored as 0-100 (e.g. `42.21` for 42.21%).

### `university_grad_demographics`
Same structure as undergrad demographics but for graduate students. Currently all null — the College Scorecard does not provide separate graduate demographic breakdowns.

### `university_cost_aid`
One row per university. Tuition, room & board, grant/aid averages, and debt figures. Bracket-level breakdowns (e.g. cost by income bracket) are stored as JSONB.

### `departments`
Central registry of all departments across all universities. Each row ties a university to a CIP field classification code.

- `UNIQUE(university_id, cip_code)` — one department per CIP field per university
- `cip_code` is a short string like `"1101"` (Computer & Info Sciences, General), `"1419"` (Mechanical Engineering), etc.
- `name` is the CIP description from the Field of Study CSV (e.g. "Computer Science", "Biology, General")

### `department_undergrad_statistics`
Per-department undergraduate metrics. One row per department.

- `total_students` — estimated enrollment, computed as `(department_awards / total_awards_at_level) × UGDS`
- `total_awards` — number of Bachelor's degrees awarded (IPEDSCOUNT2 sum for CREDLEV=3)
- `median_debt` — median student debt for Bachelor's completers (`DEBT_ALL_STGP_ANY_MDN`)
- `median_earnings_4yr` — median earnings 4 years after entry for Bachelor's completers (`EARN_MDN_4YR`)

### `department_grad_statistics`
Per-department graduate metrics. Same structure as undergrad but for grad programs. Currently not populated — the awards-based estimation approach needs review for graduate programs.

## Relationships

```
universities
├── university_undergrad_stats  (1:1)
├── university_grad_stats       (1:1)
├── university_undergrad_demographics  (1:1)
├── university_grad_demographics       (1:1)
├── university_cost_aid         (1:1)
└── departments                 (1:N)
    ├── department_undergrad_statistics  (1:1)
    └── department_grad_statistics       (1:1)
```

## Key Queries

**Get full undergrad data for a university:**
```sql
SELECT u.*, s.*, d.*, c.*
FROM universities u
JOIN university_undergrad_stats s ON s.university_id = u.id
LEFT JOIN university_undergrad_demographics d ON d.university_id = u.id
LEFT JOIN university_cost_aid c ON c.university_id = u.id
WHERE u.id = ?;
```

**Get all Computer Science departments across universities:**
```sql
SELECT ds.*, u.name AS university_name
FROM departments ds
JOIN universities u ON u.id = ds.university_id
WHERE ds.cip_code = '1101';
```

**Get undergrad department stats for a specific university:**
```sql
SELECT d.cip_code, d.name, s.total_students, s.total_awards, s.median_debt, s.median_earnings_4yr
FROM department_undergrad_statistics s
JOIN departments d ON d.id = s.department_id
WHERE d.university_id = ?;
```

**Find unreliable graduation rates (small sample sizes):**
```sql
SELECT u.name, s.graduation_rate, s.graduation_rate_extended
FROM universities u
JOIN university_undergrad_stats s ON s.university_id = u.id
WHERE s.graduation_rate_reliable = false
ORDER BY s.total_students DESC;
```
