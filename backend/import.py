import argparse
import csv
import json
import os
import sys

import psycopg2
from dotenv import load_dotenv


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def parse_float(val):
    """Parse a CSV value to float, returning None for non-numeric entries."""
    if val in (None, "", "NA", "NULL", "PrivacySuppressed", "PS"):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def parse_int(val):
    """Parse a CSV value to int, returning None for non-numeric entries."""
    f = parse_float(val)
    if f is None:
        return None
    return int(f)


CONTROL_MAP = {
    "1": "public",
    "2": "private_nonprofit",
    "3": "private_forprofit",
}


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
    control = row.get("CONTROL", "")

    # --- universities ---
    universities = {
        "unit_id": parse_int(row.get("UNITID")),
        "name": row.get("INSTNM") or None,
        "location": (f"{row['CITY']}, {row['STABBR']}" if row.get("CITY") and row.get("STABBR") else None),
        "website": row.get("INSTURL") or None,
        "is_public": control == "1",
        "sector_type": CONTROL_MAP.get(control),
    }

    # --- shared institution-level values ---
    admissions_rate = parse_float(row.get("ADM_RATE")) or parse_float(row.get("ADM_RATE_SUPP"))
    student_faculty_ratio = parse_float(row.get("STUFACR"))
    avg_household_income = parse_float(row.get("FAMINC"))
    avg_household_income_int = int(avg_household_income) if avg_household_income is not None else None

    # SAT is verbal + math midpoints summed
    sat_vr = parse_float(row.get("SATVRMID"))
    sat_mt = parse_float(row.get("SATMTMID"))
    sat_score = int(sat_vr + sat_mt) if sat_vr is not None and sat_mt is not None else None

    # Graduation rate: prefer pooled (2-year rolling avg) over raw single-year.
    # Reliable flag: True unless the _SUPP column is "PS" (suppressed, n<30).
    graduation_rate = parse_float(row.get("C150_4_POOLED")) or parse_float(row.get("C150_4"))
    graduation_rate_extended = parse_float(row.get("C200_4_POOLED")) or parse_float(row.get("C200_4"))
    supp_val = row.get("C150_4_POOLED_SUPP", "")
    graduation_rate_reliable = supp_val not in ("PS", "PrivacySuppressed", "")

    # --- undergrad_stats ---
    undergrad_stats = {
        "total_students": parse_int(row.get("UGDS")),
        "graduation_rate": graduation_rate,
        "graduation_rate_extended": graduation_rate_extended,
        "graduation_rate_reliable": graduation_rate_reliable,
        "admissions_rate": admissions_rate,
        "student_faculty_ratio": student_faculty_ratio,
        "average_class_size": None,
        "avg_household_income": avg_household_income_int,
        "sat_score": sat_score,
        "act_score": parse_int(row.get("ACTCM50")),
    }

    # --- grad_stats ---
    # Scorecard does not have separate grad admission rates or student-faculty
    # ratios — these are institution-level, so we reuse the same values.
    grad_stats = {
        "total_students": parse_int(row.get("GRADS")),
        "graduation_rate": graduation_rate,
        "graduation_rate_extended": graduation_rate_extended,
        "graduation_rate_reliable": graduation_rate_reliable,
        "admissions_rate": admissions_rate,
        "student_faculty_ratio": student_faculty_ratio,
        "average_class_size": None,
        "avg_household_income": avg_household_income_int,
    }

    # --- undergrad_demographics ---
    # Assemble JSONB arrays from individual percentage columns.
    # Values are decimals (0.0-1.0); multiply by 100 for display.
    def pct(val):
        f = parse_float(val)
        return round(f * 100, 2) if f is not None else None

    gender_entries = [
        {"name": "Male", "value": pct(row.get("UGDS_MEN"))},
        {"name": "Female", "value": pct(row.get("UGDS_WOMEN"))},
    ]
    gender_data = [e for e in gender_entries if e["value"] is not None] or None

    ethnicity_map = [
        ("White", "UGDS_WHITE"),
        ("Black", "UGDS_BLACK"),
        ("Hispanic", "UGDS_HISP"),
        ("Asian", "UGDS_ASIAN"),
        ("American Indian", "UGDS_AIAN"),
        ("Native Hawaiian/Pacific Islander", "UGDS_NHPI"),
        ("Two or More Races", "UGDS_2MOR"),
        ("Non-resident Alien", "UGDS_NRA"),
        ("Unknown", "UGDS_UNKN"),
    ]
    ethnicity_entries = [{"name": name, "value": pct(row.get(col))} for name, col in ethnicity_map]
    ethnicity_data = [e for e in ethnicity_entries if e["value"] is not None] or None

    income_map = [
        ("< $30k", "INC_PCT_LO"),
        ("$30k - $48k", "INC_PCT_M1"),
        ("$48k - $75k", "INC_PCT_M2"),
        ("$75k - $110k", "INC_PCT_H1"),
        ("> $110k", "INC_PCT_H2"),
    ]
    income_entries = [{"name": name, "value": pct(row.get(col))} for name, col in income_map]
    income_data = [e for e in income_entries if e["value"] is not None] or None

    undergrad_demographics = {
        "gender_data": gender_data,
        "ethnicity_data": ethnicity_data,
        "income_data": income_data,
    }

    # --- grad_demographics ---
    # Scorecard does not provide separate grad demographic breakdowns.
    grad_demographics = {
        "gender_data": None,
        "ethnicity_data": None,
        "income_data": None,
    }

    # --- cost_aid ---
    cost_aid = {
        "tuition_in_state": parse_int(row.get("TUITIONFEE_IN")),
        "tuition_out_state": parse_int(row.get("TUITIONFEE_OUT")),
        "room_board": None,
        "avg_grantaid": None,
        "avg_net_price_overall": parse_int(row.get("COSTT4_A")),
        "avg_net_price_by_income": None,
        "median_debt_overall": parse_int(row.get("DEBT_MDN")),
        "median_debt_by_income": None,
    }

    return {
        "universities": universities,
        "undergrad_stats": undergrad_stats,
        "grad_stats": grad_stats,
        "undergrad_demographics": undergrad_demographics,
        "grad_demographics": grad_demographics,
        "cost_aid": cost_aid,
    }


# ──────────────────────────────────────────────────────────────
# Insert Functions
# ──────────────────────────────────────────────────────────────

def insert_university(conn, data):
    """Insert into universities table.

    Columns: id, unit_id, name, location, website, is_public, sector_type, icon,
             created_at, updated_at
    
    Return the id of the inserted or updated university.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO universities (unit_id, name, location, website, is_public, sector_type)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (unit_id) DO UPDATE SET
                name        = EXCLUDED.name,
                location    = EXCLUDED.location,
                website     = EXCLUDED.website,
                is_public   = EXCLUDED.is_public,
                sector_type = EXCLUDED.sector_type,
                updated_at  = now()
            RETURNING id
            """,
            (
                data["unit_id"],
                data["name"],
                data["location"],
                data["website"],
                data["is_public"],
                data["sector_type"],
            ),
        )
        return cur.fetchone()[0]


def insert_undergrad_stats(conn, university_id, data):
    """Insert into university_undergrad_stats table.

    Columns: id, university_id, total_students, total_students_percentile,
             graduation_rate, graduation_rate_extended, graduation_rate_reliable,
             graduation_rate_percentile, admissions_rate,
             admissions_rate_percentile, student_faculty_ratio,
             student_faculty_ratio_percentile, average_class_size,
             avg_household_income, avg_household_income_percentile,
             sat_score, sat_score_percentile, act_score, act_score_percentile,
             created_at, updated_at
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_undergrad_stats
                (university_id, total_students, graduation_rate,
                 graduation_rate_extended, graduation_rate_reliable,
                 admissions_rate, student_faculty_ratio, average_class_size,
                 avg_household_income, sat_score, act_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (university_id) DO UPDATE SET
                total_students            = EXCLUDED.total_students,
                graduation_rate           = EXCLUDED.graduation_rate,
                graduation_rate_extended  = EXCLUDED.graduation_rate_extended,
                graduation_rate_reliable  = EXCLUDED.graduation_rate_reliable,
                admissions_rate           = EXCLUDED.admissions_rate,
                student_faculty_ratio     = EXCLUDED.student_faculty_ratio,
                average_class_size        = EXCLUDED.average_class_size,
                avg_household_income      = EXCLUDED.avg_household_income,
                sat_score                 = EXCLUDED.sat_score,
                act_score                 = EXCLUDED.act_score,
                updated_at                = now()
            """,
            (
                university_id,
                data["total_students"],
                data["graduation_rate"],
                data["graduation_rate_extended"],
                data["graduation_rate_reliable"],
                data["admissions_rate"],
                data["student_faculty_ratio"],
                data["average_class_size"],
                data["avg_household_income"],
                data["sat_score"],
                data["act_score"],
            ),
        )


def insert_grad_stats(conn, university_id, data):
    """Insert into university_grad_stats table.

    Columns: id, university_id, total_students, total_students_percentile,
             graduation_rate, graduation_rate_extended, graduation_rate_reliable,
             graduation_rate_percentile, admissions_rate,
             admissions_rate_percentile, student_faculty_ratio,
             student_faculty_ratio_percentile, average_class_size,
             avg_household_income, avg_household_income_percentile,
             created_at, updated_at
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_grad_stats
                (university_id, total_students, graduation_rate,
                 graduation_rate_extended, graduation_rate_reliable,
                 admissions_rate, student_faculty_ratio, average_class_size,
                 avg_household_income)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (university_id) DO UPDATE SET
                total_students            = EXCLUDED.total_students,
                graduation_rate           = EXCLUDED.graduation_rate,
                graduation_rate_extended  = EXCLUDED.graduation_rate_extended,
                graduation_rate_reliable  = EXCLUDED.graduation_rate_reliable,
                admissions_rate           = EXCLUDED.admissions_rate,
                student_faculty_ratio     = EXCLUDED.student_faculty_ratio,
                average_class_size        = EXCLUDED.average_class_size,
                avg_household_income      = EXCLUDED.avg_household_income,
                updated_at                = now()
            """,
            (
                university_id,
                data["total_students"],
                data["graduation_rate"],
                data["graduation_rate_extended"],
                data["graduation_rate_reliable"],
                data["admissions_rate"],
                data["student_faculty_ratio"],
                data["average_class_size"],
                data["avg_household_income"],
            ),
        )


def insert_undergrad_demographics(conn, university_id, data):
    """Insert into university_undergrad_demographics table.

    Columns: id, university_id, gender_data (JSONB), ethnicity_data (JSONB),
             income_data (JSONB)
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_undergrad_demographics
                (university_id, gender_data, ethnicity_data, income_data)
            VALUES (%s, %s::jsonb, %s::jsonb, %s::jsonb)
            ON CONFLICT (university_id) DO UPDATE SET
                gender_data    = EXCLUDED.gender_data,
                ethnicity_data = EXCLUDED.ethnicity_data,
                income_data    = EXCLUDED.income_data
            """,
            (
                university_id,
                json.dumps(data["gender_data"]),
                json.dumps(data["ethnicity_data"]),
                json.dumps(data["income_data"]),
            ),
        )


def insert_grad_demographics(conn, university_id, data):
    """Insert into university_grad_demographics table.

    Columns: id, university_id, gender_data (JSONB), ethnicity_data (JSONB),
             income_data (JSONB)
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_grad_demographics
                (university_id, gender_data, ethnicity_data, income_data)
            VALUES (%s, %s::jsonb, %s::jsonb, %s::jsonb)
            ON CONFLICT (university_id) DO UPDATE SET
                gender_data    = EXCLUDED.gender_data,
                ethnicity_data = EXCLUDED.ethnicity_data,
                income_data    = EXCLUDED.income_data
            """,
            (
                university_id,
                json.dumps(data["gender_data"]),
                json.dumps(data["ethnicity_data"]),
                json.dumps(data["income_data"]),
            ),
        )


def insert_cost_aid(conn, university_id, data):
    """Insert into university_cost_aid table.

    Columns: id, university_id, tuition_in_state, tuition_out_state,
             room_board, avg_grantaid, avg_net_price_overall,
             avg_net_price_by_income (JSONB), median_debt_overall,
             median_debt_by_income (JSONB), created_at, updated_at
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_cost_aid
                (university_id, tuition_in_state, tuition_out_state, room_board,
                 avg_grantaid, avg_net_price_overall, avg_net_price_by_income,
                 median_debt_overall, median_debt_by_income)
            VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s::jsonb)
            ON CONFLICT (university_id) DO UPDATE SET
                tuition_in_state      = EXCLUDED.tuition_in_state,
                tuition_out_state     = EXCLUDED.tuition_out_state,
                room_board            = EXCLUDED.room_board,
                avg_grantaid          = EXCLUDED.avg_grantaid,
                avg_net_price_overall = EXCLUDED.avg_net_price_overall,
                avg_net_price_by_income = EXCLUDED.avg_net_price_by_income,
                median_debt_overall   = EXCLUDED.median_debt_overall,
                median_debt_by_income = EXCLUDED.median_debt_by_income,
                updated_at            = now()
            """,
            (
                university_id,
                data["tuition_in_state"],
                data["tuition_out_state"],
                data["room_board"],
                data["avg_grantaid"],
                data["avg_net_price_overall"],
                json.dumps(data["avg_net_price_by_income"]),
                data["median_debt_overall"],
                json.dumps(data["median_debt_by_income"]),
            ),
        )


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import College Scorecard CSV data into uniDB")
    parser.add_argument("csv_path", help="Path to the CSV file to import")
    parser.add_argument("--dry-run", action="store_true", help="Parse and map rows without writing to the database")
    args = parser.parse_args()

    rows = read_csv(args.csv_path)
    print(f"Read {len(rows)} rows from {args.csv_path}")

    if args.dry_run:
        for i, row in enumerate(rows[:5]):
            mapped = map_row(row)
            print(f"\nRow {i}:")
            for table, fields in mapped.items():
                print(f"  {table}: {json.dumps(fields, indent=4)}")
        print(f"\nDry run complete. {len(rows)} rows would be imported.")
        return

    db_url = load_config()

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
