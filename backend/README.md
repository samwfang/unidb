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

## How the PostgreSQL Environment Works

### `load_config()` (import.py:14-20)

This function handles all configuration before a database connection is made. It does two things in sequence:

1. **`load_dotenv()`** — Scans for a `.env` file starting in the current working directory and walking up to parent directories. For each `KEY=value` line it finds, it injects that pair into `os.environ`. If the variable already exists in the shell environment, `load_dotenv()` leaves it alone (it does not overwrite). This means you can override `.env` values with real shell env vars if needed.

2. **`os.getenv("DATABASE_URL")`** — After dotenv has loaded, this reads the `DATABASE_URL` key from the process environment. If the key is missing (no `.env` file, or the file doesn't contain it), it returns `None`, and the function prints an error and exits with `sys.exit(1)` before any database driver is imported or connection attempted.

The expected format of `DATABASE_URL` is a standard PostgreSQL connection string:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

psycopg2 parses this URL internally to extract the host, port, database name, username, and password.

### `get_connection(db_url)` (import.py:23-24)

Takes the validated connection string and passes it directly to `psycopg2.connect()`. This single call:

1. **Resolves the host** — DNS lookup on the hostname from the URL.
2. **Opens a TCP socket** — Connects to the port (default 5432).
3. **Authenticates** — Sends the username/password to PostgreSQL's authentication system.
4. **Selects the database** — Issues a startup packet with the database name.
5. **Returns a connection object** — This object represents a persistent session to the database. All queries and transactions go through it.

The connection is **not** autocommit by default. This means every `INSERT`/`UPDATE` runs inside a transaction that must be explicitly committed or rolled back — which is exactly how `main()` uses it (see below).

### `main()` transaction flow (import.py:154-197)

The `main()` function ties everything together:

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
- **`conn.cursor()`** is used as a context manager (`with` block), which automatically closes the cursor when the block exits, even on exceptions.

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

Each `insert_*` function (once implemented) will use `INSERT ... ON CONFLICT` so that re-running the import on the same CSV updates existing rows instead of failing with a duplicate key error.
