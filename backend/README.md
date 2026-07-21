# uniDB Import Script

## Setup

```bash
cd backend
cp .env.example .env   # then edit with your PostgreSQL credentials
pip install -r requirements.txt
python import.py data.csv
```

Use `--dry-run` to preview parsed rows without writing to the database:

```bash
python import.py data.csv --dry-run
```

## Data Source

Imports from the [College Scorecard](https://collegescorecard.ed.gov/) CSV file (`Most-Recent-Cohorts-Institution.csv`). The import reads ~30 columns out of the 3,300+ available in the Scorecard. See `COLUMN_MAPPING.md` for a full catalog of available variables.

## How the PostgreSQL Environment Works

### `load_config()` (import.py)

This function handles all configuration before a database connection is made. It does two things in sequence:

1. **`load_dotenv()`** — Scans for a `.env` file starting in the current working directory and walking up to parent directories. For each `KEY=value` line it finds, it injects that pair into `os.environ`. If the variable already exists in the shell environment, `load_dotenv()` leaves it alone (it does not overwrite). This means you can override `.env` values with real shell env vars if needed.

2. **`os.getenv("DATABASE_URL")`** — After dotenv has loaded, this reads the `DATABASE_URL` key from the process environment. If the key is missing (no `.env` file, or the file doesn't contain it), it returns `None`, and the function prints an error and exits with `sys.exit(1)` before any database driver is imported or connection attempted.

The expected format of `DATABASE_URL` is a standard PostgreSQL connection string:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

psycopg2 parses this URL internally to extract the host, port, database name, username, and password.

### `get_connection(db_url)`

Takes the validated connection string and passes it directly to `psycopg2.connect()`. The connection is **not** autocommit by default, so every `INSERT`/`UPDATE` runs inside a transaction that must be explicitly committed or rolled back.

### `map_row(row)`

Transforms a single CSV row dict into a structured dict keyed by table name. Handles:

- **Graduation rates**: Uses `C150_4_POOLED` (2-year rolling average) as the primary rate, with `C150_4` as fallback. `C200_4_POOLED` is used for the extended (8-year) rate. The `C150_4_POOLED_SUPP` column determines reliability — if the value is `PS` (suppressed, n<30), the rate is flagged as unreliable.
- **Admissions rate**: Uses `ADM_RATE` with `ADM_RATE_SUPP` as fallback.
- **SAT score**: Sum of verbal (`SATVRMID`) and math (`SATMTMID`) midpoints.
- **Demographics**: Assembles JSONB arrays from individual percentage columns, multiplied by 100 for display.

### `main()` transaction flow

```
load_config()          → gets DATABASE_URL from .env
read_csv(path)         → parses CSV into list of dicts
get_connection(db_url) → opens the PostgreSQL connection

try:
    for each row:
        map_row(row)            → transforms CSV columns into table-specific dicts
        insert_university()     → inserts into universities, returns the new id
        insert_*()              → inserts into each related table using that id
    conn.commit()               → saves all changes permanently
except:
    conn.rollback()             → undoes everything on any error
finally:
    conn.close()                → always releases the connection
```

Key points about this flow:

- **All inserts happen in one transaction.** Nothing is saved to the database until `conn.commit()` is called after all rows are processed. If the script crashes on row 500 out of 7000, zero rows are persisted — you can fix the issue and re-run without duplicates.
- **`rollback()` on error** ensures a partial import doesn't leave the database in an inconsistent state.
- **`finally: conn.close()`** guarantees the connection is released even if an unexpected exception (like `KeyboardInterrupt`) occurs.

### Table insertion order

The inserts follow the foreign key dependency chain:

```
universities  (must go first — other tables reference its id)
  ├── university_undergrad_stats
  ├── university_grad_stats
  ├── university_undergrad_demographics
  ├── university_grad_demographics
  └── university_cost_aid
```

All `insert_*` functions use `INSERT ... ON CONFLICT` for idempotent upserts — re-running the import on the same CSV updates existing rows instead of failing with a duplicate key error.

### Insert functions

Each function opens its own cursor within the caller's transaction. `insert_university` uses `RETURNING id` to provide the foreign key for child table inserts. The remaining five functions insert/update using `ON CONFLICT (university_id)`.

- `insert_university` — conflicts on `unit_id` (College Scorecard's unique institution identifier)
- `insert_undergrad_stats` / `insert_grad_stats` — conflicts on `university_id`
- `insert_undergrad_demographics` / `insert_grad_demographics` — conflicts on `university_id`
- `insert_cost_aid` — conflicts on `university_id`
