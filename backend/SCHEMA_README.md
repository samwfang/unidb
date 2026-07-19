# UniDB Database Schema

PostgreSQL database for storing university and department data.

## Tables

### `universities`
Core information for each university — name, location, website, and classification.

- `sector_type` is one of: `public`, `private_nonprofit`, `private_forprofit`

### `university_undergrad_stats`
One row per university. Contains undergraduate-level statistics with paired percentile columns (e.g. `graduation_rate` + `graduation_rate_percentile`). Includes SAT/ACT scores which are undergrad-only.

### `university_grad_stats`
Same structure as undergrad stats but without SAT/ACT fields. Separate table because the two modes have different column sets.

### `university_undergrad_demographics`
One row per university. Stores undergraduate gender, ethnicity, and income breakdowns as JSONB arrays of `{"name": "...", "value": N}` objects.

### `university_grad_demographics`
Same structure as undergrad demographics but for graduate students.

### `university_cost_aid`
One row per university. Tuition, room & board, grant/aid averages, and debt figures. Bracket-level breakdowns (e.g. cost by income bracket) are stored as JSONB.

### `departments`
Central registry of all departments across all universities. Each row ties a university to a CIP field classification code.

- `UNIQUE(university_id, cip_code)` — one department per CIP field per university
- `cip_code` is a short string like `"11"` (Computer & Info Sciences), `"14"` (Engineering), etc.
- `name` is the university-specific department name (e.g. "Computer Science", "EECS")

### `department_statistics`
Per-department metrics linked to a specific `department_id` and `mode` (`undergrad` or `grad`). Contains student count, graduation rate, and class size with percentiles.

- `UNIQUE(department_id, mode)` — one stat row per department per mode

## Relationships

```
universities
├── university_undergrad_stats  (1:1)
├── university_grad_stats       (1:1)
├── university_undergrad_demographics  (1:1)
├── university_grad_demographics       (1:1)
├── university_cost_aid         (1:1)
└── departments                 (1:N)
    └── department_statistics   (1:N)
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
WHERE ds.cip_code = '11';
```

**Get department stats for a specific university:**
```sql
SELECT ds.*, d.name AS dept_name
FROM department_statistics ds
JOIN departments d ON d.id = ds.department_id
WHERE d.university_id = ? AND d.cip_code = ?;
```
