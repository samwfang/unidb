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
        "pred_deg": parse_int(row.get("PREDDEG")),
    }

    # --- shared institution-level values ---
    admissions_rate = parse_float(row.get("ADM_RATE")) or parse_float(row.get("ADM_RATE_SUPP"))
    student_faculty_ratio = parse_float(row.get("STUFACR"))
    avg_family_income_nslds = parse_float(row.get("FAMINC"))
    avg_family_income_nslds_int = int(avg_family_income_nslds) if avg_family_income_nslds is not None else None

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
        "avg_family_income_nslds": avg_family_income_nslds_int,
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
        "avg_family_income_nslds": avg_family_income_nslds_int,
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
        "median_hh_income": parse_int(row.get("MEDIAN_HH_INC")),
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

    Columns: id, unit_id, name, location, website, is_public, sector_type, pred_deg,
             icon, created_at, updated_at
    
    Return the id of the inserted or updated university.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO universities (unit_id, name, location, website, is_public, sector_type, pred_deg)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (unit_id) DO UPDATE SET
                name        = EXCLUDED.name,
                location    = EXCLUDED.location,
                website     = EXCLUDED.website,
                is_public   = EXCLUDED.is_public,
                sector_type = EXCLUDED.sector_type,
                pred_deg    = EXCLUDED.pred_deg,
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
                data["pred_deg"],
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
             avg_family_income_nslds, avg_family_income_nslds_percentile,
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
                 avg_family_income_nslds, sat_score, act_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (university_id) DO UPDATE SET
                total_students            = EXCLUDED.total_students,
                graduation_rate           = EXCLUDED.graduation_rate,
                graduation_rate_extended  = EXCLUDED.graduation_rate_extended,
                graduation_rate_reliable  = EXCLUDED.graduation_rate_reliable,
                admissions_rate           = EXCLUDED.admissions_rate,
                student_faculty_ratio     = EXCLUDED.student_faculty_ratio,
                average_class_size        = EXCLUDED.average_class_size,
                avg_family_income_nslds   = EXCLUDED.avg_family_income_nslds,
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
                data["avg_family_income_nslds"],
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
             avg_family_income_nslds, avg_family_income_nslds_percentile,
             created_at, updated_at
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_grad_stats
                (university_id, total_students, graduation_rate,
                 graduation_rate_extended, graduation_rate_reliable,
                 admissions_rate, student_faculty_ratio, average_class_size,
                 avg_family_income_nslds)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (university_id) DO UPDATE SET
                total_students            = EXCLUDED.total_students,
                graduation_rate           = EXCLUDED.graduation_rate,
                graduation_rate_extended  = EXCLUDED.graduation_rate_extended,
                graduation_rate_reliable  = EXCLUDED.graduation_rate_reliable,
                admissions_rate           = EXCLUDED.admissions_rate,
                student_faculty_ratio     = EXCLUDED.student_faculty_ratio,
                average_class_size        = EXCLUDED.average_class_size,
                avg_family_income_nslds   = EXCLUDED.avg_family_income_nslds,
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
                data["avg_family_income_nslds"],
            ),
        )


def insert_undergrad_demographics(conn, university_id, data):
    """Insert into university_undergrad_demographics table.

    Columns: id, university_id, gender_data (JSONB), ethnicity_data (JSONB),
             income_data (JSONB), median_hh_income
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO university_undergrad_demographics
                (university_id, gender_data, ethnicity_data, income_data, median_hh_income)
            VALUES (%s, %s::jsonb, %s::jsonb, %s::jsonb, %s)
            ON CONFLICT (university_id) DO UPDATE SET
                gender_data      = EXCLUDED.gender_data,
                ethnicity_data   = EXCLUDED.ethnicity_data,
                income_data      = EXCLUDED.income_data,
                median_hh_income = EXCLUDED.median_hh_income
            """,
            (
                university_id,
                json.dumps(data["gender_data"]),
                json.dumps(data["ethnicity_data"]),
                json.dumps(data["income_data"]),
                data["median_hh_income"],
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
# Field of Study Import
#
# Imports department-level data from the College Scorecard Field
# of Study CSV. The main goal is to estimate per-department
# undergraduate enrollment by computing each department's share
# of total awards and multiplying by the institution's UGDS.
#
# Pipeline:
#   read_fos_csv()         → parse the raw CSV
#   group_fos_rows()       → aggregate by (unit_id, cip_code, cred_lev)
#   compute_awards_by_level() → sum total awards per (unit_id, cred_lev)
#   estimate_enrollment()  → compute percentage × enrollment base
#   insert_department() + insert_department_statistics() → write to DB
# ──────────────────────────────────────────────────────────────

# CREDLEV mapping: credential level → mode (undergrad/grad)
# 1 = Undergraduate Certificate, 2 = Associate's, 3 = Bachelor's, 4 = Postbaccalaureate
# 5 = Master's, 6 = Doctoral, 7 = First Professional, 8 = Graduate/Professional Certificate
CREDLEV_MODE = {
    1: "undergrad",
    2: "undergrad",
    3: "undergrad",
    4: "undergrad",
    5: "grad",
    6: "grad",
    7: "grad",
    8: "grad",
}

# Debt/earnings only from these credential levels:
# Bachelor's (3) for undergrad, Master's (5) and Doctoral (6) for grad
CREDLEV_INCLUDE_DEBT_EARNINGS = {3, 5, 6}


def read_fos_csv(path):
    """Read Field of Study CSV and return a list of row dicts.

    The CSV contains one row per institution × CIP code × credential level,
    with columns for award counts, debt, and earnings data.
    """
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader)


def group_fos_rows(rows):
    """Group Field of Study rows by (UNITID, CIPCODE, CREDLEV).

    Aggregates award counts across all rows sharing the same institution,
    CIP code, and credential level. Skips rows with no awards (IPEDSCOUNT2)
    or unrecognized credential levels.

    Debt and earnings are only captured from Bachelor's (CREDLEV=3) for
    undergrad, and Master's/Doctoral (CREDLEV=5,6) for grad. Certificate
    and associate's degree rows are excluded from debt/earnings because
    those credential levels have different financial profiles.

    Returns:
        {
            (unit_id, cip_code, cred_lev): {
                "cip_desc": str,               # CIP field description
                "total_awards": int,            # sum of IPEDSCOUNT2
                "median_debt": int or None,     # from DEBT_ALL_STGP_ANY_MDN
                "median_earnings_4yr": int or None,  # from EARN_MDN_4YR
            }
        }
    """
    grouped = {}
    for row in rows:
        unit_id = parse_int(row.get("UNITID"))
        cip_code = row.get("CIPCODE")
        cred_lev = parse_int(row.get("CREDLEV"))

        if not all([unit_id, cip_code, cred_lev]):
            continue
        if cred_lev not in CREDLEV_MODE:
            continue

        awards = parse_int(row.get("IPEDSCOUNT2"))
        if awards is None or awards <= 0:
            continue

        key = (unit_id, cip_code, cred_lev)
        if key not in grouped:
            grouped[key] = {
                "cip_desc": row.get("CIPDESC", "").rstrip("."),
                "total_awards": 0,
                "median_debt": None,
                "median_earnings_4yr": None,
            }

        grouped[key]["total_awards"] += awards

        # Only include debt/earnings from Bachelor's (undergrad) or Master's/Doctoral (grad)
        if cred_lev in CREDLEV_INCLUDE_DEBT_EARNINGS:
            if grouped[key]["median_debt"] is None:
                grouped[key]["median_debt"] = parse_int(row.get("DEBT_ALL_STGP_ANY_MDN"))
            if grouped[key]["median_earnings_4yr"] is None:
                grouped[key]["median_earnings_4yr"] = parse_int(row.get("EARN_MDN_4YR"))

    return grouped


def compute_awards_by_level(grouped):
    """Compute total awards per (unit_id, cred_lev) for percentage calculation.

    This is used as the denominator when computing each department's share
    of total awards at a given credential level (e.g., all Bachelor's awards
    at a university).

    Returns:
        {
            (unit_id, cred_lev): total_awards
        }
    """
    totals = {}
    for (unit_id, cip_code, cred_lev), data in grouped.items():
        key = (unit_id, cred_lev)
        totals[key] = totals.get(key, 0) + data["total_awards"]
    return totals


def estimate_enrollment(grouped, level_totals, ugds_map, grads_map):
    """Estimate per-department student counts using awards-based percentages.

    The estimation formula is:
        percentage = department_awards / total_awards_at_level
        estimated_students = round(percentage × enrollment_base)

    where enrollment_base is UGDS for undergrad or GRADS for grad.

    Note: This is an approximation. Awards ≠ enrollment — students who
    don't complete their degree don't appear in the awards data. Programs
    with low completion rates will appear smaller than they actually are.

    Args:
        grouped: Output of group_fos_rows()
        level_totals: Output of compute_awards_by_level()
        ugds_map: {unit_id: UGDS} from institution CSV
        grads_map: {unit_id: GRADS} from institution CSV (currently unused)

    Returns:
        list of {
            "unit_id": int,
            "cip_code": str,
            "cip_desc": str,
            "mode": str,                 # "undergrad" or "grad"
            "total_students": int,        # estimated enrollment
            "total_awards": int,          # department's award count
            "median_debt": int or None,
            "median_earnings_4yr": int or None,
        }
    """
    results = []
    for (unit_id, cip_code, cred_lev), data in grouped.items():
        mode = CREDLEV_MODE[cred_lev]
        level_key = (unit_id, cred_lev)
        total_awards = level_totals.get(level_key, 0)

        if total_awards == 0:
            continue

        # Get enrollment base
        if mode == "undergrad":
            enrollment_base = ugds_map.get(unit_id)
        else:
            enrollment_base = grads_map.get(unit_id)

        if not enrollment_base or enrollment_base <= 0:
            continue

        percentage = data["total_awards"] / total_awards
        estimated_students = max(1, round(percentage * enrollment_base))

        results.append({
            "unit_id": unit_id,
            "cip_code": cip_code,
            "cip_desc": data["cip_desc"],
            "mode": mode,
            "total_students": estimated_students,
            "total_awards": data["total_awards"],
            "median_debt": data["median_debt"],
            "median_earnings_4yr": data["median_earnings_4yr"],
        })

    return results


def insert_department(conn, university_id, cip_code, name):
    """Insert or get a department row. Returns department_id.

    Uses ON CONFLICT (university_id, cip_code) to handle re-imports:
    if the department already exists, it updates the name and returns
    the existing id.

    Returns department_id (int) for the inserted or existing department.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO departments (university_id, cip_code, name)
            VALUES (%s, %s, %s)
            ON CONFLICT (university_id, cip_code) DO UPDATE SET
                name = EXCLUDED.name
            RETURNING id
            """,
            (university_id, cip_code, name),
        )
        return cur.fetchone()[0]


def insert_department_statistics(conn, department_id, data):
    """Insert or update department statistics for undergrad only.

    Currently skips grad data — the awards-based estimation approach
    does not work well for graduate programs because GRADS counts are
    less reliable and the award-to-enrollment ratio varies widely.
    """
    if data["mode"] != "undergrad":
        return  # Skip grad for now
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO department_undergrad_statistics
                (department_id, total_students, total_awards,
                 median_debt, median_earnings_4yr)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (department_id) DO UPDATE SET
                total_students      = EXCLUDED.total_students,
                total_awards        = EXCLUDED.total_awards,
                median_debt         = EXCLUDED.median_debt,
                median_earnings_4yr = EXCLUDED.median_earnings_4yr
            """,
            (
                department_id,
                data["total_students"],
                data["total_awards"],
                data["median_debt"],
                data["median_earnings_4yr"],
            ),
        )


# ──────────────────────────────────────────────────────────────
# Percentiles
#
# Percentiles are computed AFTER all institutions are imported, so
# they reflect the population of 4-year institutions (PREDDEG = 3)
# — the same population used for global averages. For each metric
# column, every non-NULL value is ranked with percent_rank()
# (fraction of rows strictly below the value) and stored as an
# integer 0-100. Rows whose metric is NULL keep a NULL percentile.
# ──────────────────────────────────────────────────────────────

PERCENTILE_COLUMNS = {
    "university_undergrad_stats": [
        "total_students",
        "graduation_rate",
        "admissions_rate",
        "student_faculty_ratio",
        "avg_family_income_nslds",
        "sat_score",
        "act_score",
    ],
    "university_grad_stats": [
        "total_students",
        "graduation_rate",
        "admissions_rate",
        "student_faculty_ratio",
        "avg_family_income_nslds",
    ],
}


def compute_percentiles(conn):
    """Compute and store the percentile for each metric in both stats tables.

    Rankings only include 4-year institutions (PREDDEG = 3), matching the
    population used for global averages.
    """
    for table, metrics in PERCENTILE_COLUMNS.items():
        with conn.cursor() as cur:
            for metric in metrics:
                percentile_col = f"{metric}_percentile"
                cur.execute(
                    f"""
                    UPDATE {table} s
                    SET {percentile_col} = p.percentile
                    FROM (
                        SELECT st.university_id,
                               ROUND(percent_rank() OVER (ORDER BY st.{metric}) * 100)::int
                                   AS percentile
                        FROM {table} st
                        JOIN universities u ON u.id = st.university_id
                        WHERE u.pred_deg = 3 AND st.{metric} IS NOT NULL
                    ) p
                    WHERE s.university_id = p.university_id
                    """
                )
                print(f"  {table}.{percentile_col}: {cur.rowcount} rows updated")


def recompute_percentiles(db_url):
    """Recompute percentiles without re-importing institution data."""
    conn = get_connection(db_url)
    try:
        compute_percentiles(conn)
        conn.commit()
        print("Successfully recomputed percentiles.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        conn.close()


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def import_institution_csv(csv_path, db_url, dry_run=False):
    """Import institution-level data from the main Scorecard CSV."""
    rows = read_csv(csv_path)
    print(f"Read {len(rows)} rows from {csv_path}")

    if dry_run:
        for i, row in enumerate(rows[:5]):
            mapped = map_row(row)
            print(f"\nRow {i}:")
            for table, fields in mapped.items():
                print(f"  {table}: {json.dumps(fields, indent=4)}")
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

            print("Computing percentiles...")
            compute_percentiles(conn)

            conn.commit()
            print(f"Successfully imported {len(rows)} universities.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        conn.close()


def import_fos_csv(fos_path, db_url, dry_run=False):
    """Import Field of Study data: estimate department enrollment from awards.

    Reads the Field of Study CSV, aggregates award counts by CIP code and
    credential level, then estimates per-department enrollment using the
    formula: (department_awards / total_awards) × UGDS.

    Requires that institution data has already been imported (for UGDS values).

    Args:
        fos_path: Path to Most-Recent-Cohorts-Field-of-Study.csv
        db_url: PostgreSQL connection string
        dry_run: If True, print top estimates without writing to DB
    """
    rows = read_fos_csv(fos_path)
    print(f"Read {len(rows)} Field of Study rows from {fos_path}")

    # Group and aggregate
    grouped = group_fos_rows(rows)
    level_totals = compute_awards_by_level(grouped)
    print(f"Aggregated to {len(grouped)} unique (unit_id, cip_code, cred_lev) combinations")

    # Load enrollment bases from institution data
    # We query the DB for existing UGDS values
    conn = get_connection(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.unit_id, us.total_students
                FROM university_undergrad_stats us
                JOIN universities u ON u.id = us.university_id
            """)
            ugds_map = {uid: ts for uid, ts in cur.fetchall() if ts}

            grads_map = {}  # Not used for now
    finally:
        conn.close()

    print(f"Loaded enrollment data for {len(ugds_map)} undergrad institutions")

    # Estimate
    estimates = estimate_enrollment(grouped, level_totals, ugds_map, grads_map)
    print(f"Computed {len(estimates)} department-level enrollment estimates")

    if dry_run:
        # Show top 20 estimates by total_students
        estimates.sort(key=lambda x: x["total_students"], reverse=True)
        for e in estimates[:20]:
            print(f"  {e['unit_id']} | {e['cip_code']} ({e['cip_desc'][:40]}) | "
                  f"{e['mode']:10s} | {e['total_students']:>6,} students | "
                  f"{e['total_awards']:>5,} awards")
        return

    # Write to database
    conn = get_connection(db_url)
    try:
        with conn.cursor() as cur:
            # Build unit_id → universities.id lookup
            cur.execute("SELECT unit_id, id FROM universities")
            uid_to_university_id = dict(cur.fetchall())

            inserted = 0
            for i, est in enumerate(estimates):
                university_id = uid_to_university_id.get(est["unit_id"])
                if not university_id:
                    continue

                dept_id = insert_department(
                    conn, university_id, est["cip_code"], est["cip_desc"]
                )
                insert_department_statistics(conn, dept_id, est)
                inserted += 1

                if (i + 1) % 5000 == 0:
                    print(f"  Processed {i + 1}/{len(estimates)}...")

            conn.commit()
            print(f"Successfully imported {inserted} department statistics.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Import College Scorecard CSV data into uniDB")
    subparsers = parser.add_subparsers(dest="command", help="Import command")

    # institution subcommand
    inst_parser = subparsers.add_parser("institution", help="Import institution-level CSV")
    inst_parser.add_argument("csv_path", help="Path to Most-Recent-Cohorts-Institution.csv")
    inst_parser.add_argument("--dry-run", action="store_true",
                             help="Parse and map rows without writing to the database")

    # fos subcommand (Field of Study)
    fos_parser = subparsers.add_parser("fos", help="Import Field of Study CSV")
    fos_parser.add_argument("csv_path", help="Path to Most-Recent-Cohorts-Field-of-Study.csv")
    fos_parser.add_argument("--dry-run", action="store_true",
                            help="Compute estimates without writing to the database")

    # percentiles subcommand
    subparsers.add_parser("percentiles", help="Recompute percentiles from existing data")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    db_url = load_config()

    if args.command == "institution":
        import_institution_csv(args.csv_path, db_url, dry_run=args.dry_run)
    elif args.command == "fos":
        import_fos_csv(args.csv_path, db_url, dry_run=args.dry_run)
    elif args.command == "percentiles":
        recompute_percentiles(db_url)


if __name__ == "__main__":
    main()
