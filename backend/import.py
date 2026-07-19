import argparse
import csv
import os
import sys

import psycopg2
from dotenv import load_dotenv


# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────

def load_config():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not set. Copy .env.example to .env and fill it in.")
        sys.exit(1)
    return db_url


def get_connection(db_url):
    return psycopg2.connect(db_url)


# ──────────────────────────────────────────────────────────────
# CSV Reading
# ──────────────────────────────────────────────────────────────

def read_csv(path):
    """Read a CSV file and return a list of row dicts."""
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader)


# ──────────────────────────────────────────────────────────────
# Row Mapping
# ──────────────────────────────────────────────────────────────

def map_row(row):
    """Map a raw CSV row dict to a structured dict keyed by table name.

    Returns:
        {
            "universities": { ... },
            "undergrad_stats": { ... },
            "grad_stats": { ... },
            "undergrad_demographics": { ... },
            "grad_demographics": { ... },
            "cost_aid": { ... },
        }
    """
    # TODO: Map CSV columns to table fields.
    # The CSV columns come from the College Scorecard data dictionary
    # (see CollegeScorecardDataDictionary.xlsx, institution_data_dictionary sheet).
    #
    # Example mapping stub:
    #   "universities": {
    #       "name": row.get("INSTNM"),
    #       "location": row.get("CITY") + ", " + row.get("STABBR"),
    #       ...
    #   }
    return {
        "universities": {},
        "undergrad_stats": {},
        "grad_stats": {},
        "undergrad_demographics": {},
        "grad_demographics": {},
        "cost_aid": {},
    }


# ──────────────────────────────────────────────────────────────
# Insert Functions
# ──────────────────────────────────────────────────────────────

def insert_university(conn, data):
    """Insert into universities table.

    Columns: id, name, location, website, is_public, sector_type, icon,
             created_at, updated_at
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


def insert_undergrad_stats(conn, university_id, data):
    """Insert into university_undergrad_stats table.

    Columns: id, university_id, total_students, total_students_percentile,
             graduation_rate, graduation_rate_percentile, admissions_rate,
             admissions_rate_percentile, student_faculty_ratio,
             student_faculty_ratio_percentile, average_class_size,
             avg_household_income, avg_household_income_percentile,
             sat_score, sat_score_percentile, act_score, act_score_percentile,
             created_at, updated_at
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


def insert_grad_stats(conn, university_id, data):
    """Insert into university_grad_stats table.

    Columns: id, university_id, total_students, total_students_percentile,
             graduation_rate, graduation_rate_percentile, admissions_rate,
             admissions_rate_percentile, student_faculty_ratio,
             student_faculty_ratio_percentile, average_class_size,
             avg_household_income, avg_household_income_percentile,
             created_at, updated_at
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


def insert_undergrad_demographics(conn, university_id, data):
    """Insert into university_undergrad_demographics table.

    Columns: id, university_id, gender_data (JSONB), ethnicity_data (JSONB),
             income_data (JSONB)
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


def insert_grad_demographics(conn, university_id, data):
    """Insert into university_grad_demographics table.

    Columns: id, university_id, gender_data (JSONB), ethnicity_data (JSONB),
             income_data (JSONB)
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


def insert_cost_aid(conn, university_id, data):
    """Insert into university_cost_aid table.

    Columns: id, university_id, tuition_in_state, tuition_out_state,
             room_board, avg_grantaid, avg_net_price_overall,
             avg_net_price_by_income (JSONB), median_debt_overall,
             median_debt_by_income (JSONB), created_at, updated_at
    """
    # TODO: Implement INSERT ... ON CONFLICT
    pass


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import College Scorecard CSV data into uniDB")
    parser.add_argument("csv_path", help="Path to the CSV file to import")
    parser.add_argument("--dry-run", action="store_true", help="Parse and map rows without writing to the database")
    args = parser.parse_args()

    db_url = load_config()
    rows = read_csv(args.csv_path)
    print(f"Read {len(rows)} rows from {args.csv_path}")

    if args.dry_run:
        for i, row in enumerate(rows[:5]):
            mapped = map_row(row)
            print(f"\nRow {i}:")
            for table, fields in mapped.items():
                print(f"  {table}: {fields}")
        print(f"\nDry run complete. {len(rows)} rows would be imported.")
        return

    conn = get_connection(db_url)
    try:
        with conn.cursor() as cur:
            for i, row in enumerate(rows):
                mapped = map_row(row)

                university_id = insert_university(conn, mapped["universities"])

                insert_undergrad_stats(conn, university_id, mapped["undergrad_stats"])
                insert_grad_stats(conn, university_id, mapped["grad_stats"])
                insert_undergrad_demographics(conn, university_id, mapped["undergrad_demographics"])
                insert_grad_demographics(conn, university_id, mapped["grad_demographics"])
                insert_cost_aid(conn, university_id, mapped["cost_aid"])

                if (i + 1) % 100 == 0:
                    print(f"  Imported {i + 1}/{len(rows)}...")

            conn.commit()
            print(f"Successfully imported {len(rows)} universities.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
