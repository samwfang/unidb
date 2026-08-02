import json
import os
import sys
from itertools import groupby

import psycopg2
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_restx import Api, Resource


# ──────────────────────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

api = Api(
    app,
    version="1.0",
    title="uniDB API",
    description="REST API for university data from the College Scorecard",
    doc="/swagger",
)

ns = api.namespace("api", description="University operations")


# ──────────────────────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────────────────────

def load_config():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not set.")
        sys.exit(1)
    return db_url


DB_URL = load_config()


def get_db():
    return psycopg2.connect(DB_URL)


def jsonb_extract(jsonb_col, name_value):
    return (
        f"(SELECT (elem->>'value')::numeric "
        f"FROM jsonb_array_elements("
        f"  CASE WHEN jsonb_typeof({jsonb_col}) = 'array'"
        f"    THEN {jsonb_col} ELSE '[]'::jsonb END"
        f") AS elem "
        f"WHERE elem->>'name' = '{name_value}')"
    )


# ──────────────────────────────────────────────────────────────
# Sort & Filter Maps
# ──────────────────────────────────────────────────────────────

SORT_MAP = {
    "name": "u.name",
    "location": "u.location",
    "total_students": "us.total_students",
    "graduation_rate": "us.graduation_rate",
    "admissions_rate": "us.admissions_rate",
    "sat_score": "us.sat_score",
    "act_score": "us.act_score",
    "average_class_size": "us.average_class_size",
    "student_faculty_ratio": "us.student_faculty_ratio",
    "avg_family_income_nslds": "us.avg_family_income_nslds",
    "tuition_in_state": "ca.tuition_in_state",
    "tuition_out_state": "ca.tuition_out_state",
    "avg_net_price_overall": "ca.avg_net_price_overall",
    # Gender
    "pct_male": jsonb_extract("ud.gender_data", "Male"),
    "pct_female": jsonb_extract("ud.gender_data", "Female"),
    # Ethnicity
    "pct_white": jsonb_extract("ud.ethnicity_data", "White"),
    "pct_black": jsonb_extract("ud.ethnicity_data", "Black"),
    "pct_hispanic": jsonb_extract("ud.ethnicity_data", "Hispanic"),
    "pct_asian": jsonb_extract("ud.ethnicity_data", "Asian"),
    "pct_aian": jsonb_extract("ud.ethnicity_data", "American Indian"),
    "pct_nhpi": jsonb_extract("ud.ethnicity_data", "Native Hawaiian/Pacific Islander"),
    "pct_two_plus": jsonb_extract("ud.ethnicity_data", "Two or More Races"),
    "pct_nra": jsonb_extract("ud.ethnicity_data", "Non-resident Alien"),
    "pct_unknown": jsonb_extract("ud.ethnicity_data", "Unknown"),
    # Income
    "pct_income_low": jsonb_extract("ud.income_data", "< $30k"),
    "pct_income_mid1": jsonb_extract("ud.income_data", "$30k - $48k"),
    "pct_income_mid2": jsonb_extract("ud.income_data", "$48k - $75k"),
    "pct_income_high1": jsonb_extract("ud.income_data", "$75k - $110k"),
    "pct_income_high2": jsonb_extract("ud.income_data", "> $110k"),
}

DEPT_SORT_MAP = {
    "total_students": "dus_sort.total_students",
    "total_awards": "dus_sort.total_awards",
    "median_debt": "dus_sort.median_debt",
    "median_earnings": "dus_sort.median_earnings_4yr",
}

# Filter fields: param_name → (sql_column, cast_function, optional_transform)
# transform converts user-facing input to DB value (e.g. 0-100 → 0.0-1.0 for rates)
FILTER_FIELDS = {
    "total_students":       ("us.total_students",       int,   None),
    "graduation_rate":      ("us.graduation_rate",      float, lambda v: v * 0.01),
    "admissions_rate":      ("us.admissions_rate",      float, lambda v: v * 0.01),
    "sat_score":            ("us.sat_score",            int,   None),
    "act_score":            ("us.act_score",            int,   None),
    "student_faculty_ratio":("us.student_faculty_ratio",float, None),
    "avg_family_income_nslds": ("us.avg_family_income_nslds", int, None),
    "tuition_in_state":     ("ca.tuition_in_state",     int,   None),
    "tuition_out_state":    ("ca.tuition_out_state",    int,   None),
    "avg_net_price_overall":("ca.avg_net_price_overall",int,   None),
    # Demographics (percentages 0-100)
    "pct_male":      (jsonb_extract("ud.gender_data", "Male"),            float, None),
    "pct_female":    (jsonb_extract("ud.gender_data", "Female"),          float, None),
    "pct_white":     (jsonb_extract("ud.ethnicity_data", "White"),        float, None),
    "pct_black":     (jsonb_extract("ud.ethnicity_data", "Black"),        float, None),
    "pct_hispanic":  (jsonb_extract("ud.ethnicity_data", "Hispanic"),     float, None),
    "pct_asian":     (jsonb_extract("ud.ethnicity_data", "Asian"),        float, None),
    "pct_aian":      (jsonb_extract("ud.ethnicity_data", "American Indian"),           float, None),
    "pct_nhpi":      (jsonb_extract("ud.ethnicity_data", "Native Hawaiian/Pacific Islander"), float, None),
    "pct_two_plus":  (jsonb_extract("ud.ethnicity_data", "Two or More Races"),         float, None),
    "pct_nra":       (jsonb_extract("ud.ethnicity_data", "Non-resident Alien"),        float, None),
    "pct_unknown":   (jsonb_extract("ud.ethnicity_data", "Unknown"),      float, None),
    "pct_income_low":   (jsonb_extract("ud.income_data", "< $30k"),       float, None),
    "pct_income_mid1":  (jsonb_extract("ud.income_data", "$30k - $48k"),  float, None),
    "pct_income_mid2":  (jsonb_extract("ud.income_data", "$48k - $75k"),  float, None),
    "pct_income_high1": (jsonb_extract("ud.income_data", "$75k - $110k"), float, None),
    "pct_income_high2": (jsonb_extract("ud.income_data", "> $110k"),      float, None),
}

DEPT_FILTER_FIELDS = {
    "dept_total_students":  ("dus_filter.total_students",     int, None),
    "dept_median_debt":     ("dus_filter.median_debt",        int, None),
    "dept_median_earnings": ("dus_filter.median_earnings_4yr",int, None),
}


# ──────────────────────────────────────────────────────────────
# Where helpers – plain list of (sql, params) tuples
# ──────────────────────────────────────────────────────────────

def add_condition(conditions, sql, *params):
    conditions.append((sql, params))


def build_where(conditions):
    if not conditions:
        return "", []
    return (
        "WHERE " + " AND ".join(c for c, _ in conditions),
        [p for _, params in conditions for p in params],
    )


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def format_number(value):
    if value is None:
        return ""
    return f"{int(value):,}"


def format_decimal(value):
    if value is None:
        return ""
    return str(value)


def format_currency(value):
    if value is None:
        return ""
    return f"${int(value):,}"


def format_rate(value):
    if value is None:
        return ""
    return str(int(round(value * 100)))


def parse_jsonb(value):
    if value is None:
        return None
    if isinstance(value, str):
        return json.loads(value)
    return value


# Checks request.args for min/max filters and adds them to the where conditions
def _add_field_filters(where, fields):
    for field_name, (sql_col, cast_fn, transform) in fields.items():
        min_val = request.args.get(f"min_{field_name}", type=float)
        max_val = request.args.get(f"max_{field_name}", type=float)

        if min_val is not None or max_val is not None:
            add_condition(where, f"{sql_col} IS NOT NULL")

        if min_val is not None:
            val = transform(min_val) if transform else min_val
            add_condition(where, f"{sql_col} >= %s", cast_fn(val))

        if max_val is not None:
            val = transform(max_val) if transform else max_val
            add_condition(where, f"{sql_col} <= %s", cast_fn(val))


def parse_filters(where, filter_dept=""):
    _add_field_filters(where, FILTER_FIELDS)
    if filter_dept:
        _add_field_filters(where, DEPT_FILTER_FIELDS)


# ──────────────────────────────────────────────────────────────
# Query Builders
# ──────────────────────────────────────────────────────────────

def build_count_query(where, filter_dept=""):
    where_sql, where_params = build_where(where)
    filter_join = ""
    if filter_dept:
        filter_join = (
            " LEFT JOIN departments d_filter"
            " ON d_filter.university_id = u.id AND d_filter.cip_code = %s"
            " LEFT JOIN department_undergrad_statistics dus_filter"
            " ON dus_filter.department_id = d_filter.id"
        )
    sql = (
        "SELECT COUNT(*) FROM universities u"
        " LEFT JOIN university_undergrad_stats us ON us.university_id = u.id"
        " LEFT JOIN university_cost_aid ca ON ca.university_id = u.id"
        " LEFT JOIN university_undergrad_demographics ud ON ud.university_id = u.id"
        f" {filter_join}"
        f" {where_sql}"
    )
    params = [filter_dept] if filter_dept else []
    params.extend(where_params)
    return sql, params


def build_id_query(where, sort_col, sort_dir, sort_dept, filter_dept, limit, offset):
    where_sql, where_params = build_where(where)

    order = "u.name ASC"
    sort_dept_join = ""
    sort_dept_param = None

    #check if Sort is Department-Specific and if the sort column is in the DEPT_SORT_MAP
    if sort_dept and sort_col in DEPT_SORT_MAP:
        order = f"{DEPT_SORT_MAP[sort_col]} {sort_dir} NULLS LAST, u.id ASC"
        sort_dept_param = sort_dept
        sort_dept_join = """
            LEFT JOIN departments d_sort
                ON d_sort.university_id = u.id AND d_sort.cip_code = %s
            LEFT JOIN department_undergrad_statistics dus_sort
                ON dus_sort.department_id = d_sort.id
        """
    #this means sort is general and not department-specific, so we check if the sort column is in the SORT_MAP
    elif sort_col in SORT_MAP:
        order = f"{SORT_MAP[sort_col]} {sort_dir} NULLS LAST, u.id ASC"

    filter_join = ""

    #if we are filtering by department-specific, we must join the departments and department_undergrad_statistics tables to filter by the department-specific fields
    if filter_dept:
        filter_join = """
            LEFT JOIN departments d_filter
                ON d_filter.university_id = u.id AND d_filter.cip_code = %s
            LEFT JOIN department_undergrad_statistics dus_filter
                ON dus_filter.department_id = d_filter.id
        """

    query = f"""
        SELECT u.id
        FROM universities u
        LEFT JOIN university_undergrad_stats us ON us.university_id = u.id
        LEFT JOIN university_cost_aid ca ON ca.university_id = u.id
        LEFT JOIN university_undergrad_demographics ud ON ud.university_id = u.id
        {sort_dept_join}
        {filter_join}
        {where_sql}
        ORDER BY {order}
        LIMIT %s OFFSET %s
    """

    params = []
    if sort_dept_param:
        params.append(sort_dept_param)
    if filter_dept:
        params.append(filter_dept)
    params.extend(where_params)
    params.extend([limit, offset])
    return query, params


def build_data_query(ids):
    query = """
        SELECT
            u.id, u.unit_id, u.name, u.location, u.website,
            u.is_public, u.sector_type, u.icon,
            us.total_students, us.graduation_rate, us.graduation_rate_reliable,
            us.admissions_rate, us.student_faculty_ratio, us.avg_family_income_nslds,
            us.sat_score, us.act_score,
            us.total_students_percentile, us.graduation_rate_percentile,
            us.admissions_rate_percentile, us.student_faculty_ratio_percentile,
            us.avg_family_income_nslds_percentile, us.sat_score_percentile,
            us.act_score_percentile,
            gs.total_students AS grad_total_students,
            gs.graduation_rate AS grad_graduation_rate,
            gs.graduation_rate_reliable AS grad_graduation_rate_reliable,
            gs.admissions_rate AS grad_admissions_rate,
            gs.student_faculty_ratio AS grad_student_faculty_ratio,
            gs.avg_family_income_nslds AS grad_avg_family_income_nslds,
            gs.total_students_percentile AS grad_total_students_percentile,
            gs.graduation_rate_percentile AS grad_graduation_rate_percentile,
            gs.admissions_rate_percentile AS grad_admissions_rate_percentile,
            gs.student_faculty_ratio_percentile AS grad_student_faculty_ratio_percentile,
            gs.avg_family_income_nslds_percentile AS grad_avg_family_income_nslds_percentile,
            ud.gender_data, ud.ethnicity_data, ud.income_data, ud.median_hh_income,
            gd.gender_data  AS grad_gender_data,
            gd.ethnicity_data AS grad_ethnicity_data,
            gd.income_data  AS grad_income_data,
            ca.tuition_in_state, ca.tuition_out_state,
            ca.avg_net_price_overall, ca.median_debt_overall,
            ca.avg_net_price_by_income, ca.median_debt_by_income,
            d.cip_code, d.name AS dept_name,
            dus.total_students  AS dept_total_students,
            dus.total_awards    AS dept_total_awards,
            dus.median_debt     AS dept_median_debt,
            dus.median_earnings_4yr AS dept_median_earnings
        FROM universities u
        LEFT JOIN university_undergrad_stats us ON us.university_id = u.id
        LEFT JOIN university_grad_stats gs ON gs.university_id = u.id
        LEFT JOIN university_undergrad_demographics ud ON ud.university_id = u.id
        LEFT JOIN university_grad_demographics gd ON gd.university_id = u.id
        LEFT JOIN university_cost_aid ca ON ca.university_id = u.id
        LEFT JOIN departments d ON d.university_id = u.id
        LEFT JOIN department_undergrad_statistics dus ON dus.department_id = d.id
        WHERE u.id = ANY(%s)
        ORDER BY array_position(%s::int[], u.id), d.cip_code
    """
    return query, [ids, ids]


# ──────────────────────────────────────────────────────────────
# Response Formatting
# ──────────────────────────────────────────────────────────────

def format_demographics(gender_data, ethnicity_data, income_data, median_hh_income):
    return {
        "gender": parse_jsonb(gender_data) or [],
        "ethnicity": parse_jsonb(ethnicity_data) or [],
        "income": parse_jsonb(income_data) or [],
        "median_hh_income": format_number(median_hh_income),
    }


def format_university(rows):
    if not rows:
        return None

    first = rows[0]

    undergrad_content = {
        "general_content": {
            "total_students": format_number(first["total_students"]),
            "total_student_percentile": format_decimal(first["total_students_percentile"]),
            "graduation_rate": format_rate(first["graduation_rate"]),
            "graduation_rate_percentile": format_decimal(first["graduation_rate_percentile"]),
            "admissions_rate": format_rate(first["admissions_rate"]),
            "admissions_rate_percentile": format_decimal(first["admissions_rate_percentile"]),
            "sat_score": format_number(first["sat_score"]),
            "act_score": str(first["act_score"]) if first["act_score"] else "",
            "sat_score_percentile": format_decimal(first["sat_score_percentile"]),
            "act_score_percentile": format_decimal(first["act_score_percentile"]),
            "studentFacultyRatio": format_decimal(first["student_faculty_ratio"]),
            "studentFacultyRatioPercentile": format_decimal(first["student_faculty_ratio_percentile"]),
            "avg_family_income_nslds": format_number(first["avg_family_income_nslds"]),
            "avg_family_income_nslds_percentile": format_decimal(first["avg_family_income_nslds_percentile"]),
            "average_class_size": "",
        },
        "demographics": format_demographics(
            first["gender_data"], first["ethnicity_data"], first["income_data"], first["median_hh_income"]
        ),
        "dept_contents": [],
    }

    grad_content = {
        "general_content": {
            "total_students": format_number(first["grad_total_students"]),
            "total_student_percentile": format_decimal(first["grad_total_students_percentile"]),
            "graduation_rate": format_rate(first["grad_graduation_rate"]),
            "graduation_rate_percentile": format_decimal(first["grad_graduation_rate_percentile"]),
            "admissions_rate": format_rate(first["grad_admissions_rate"]),
            "admissions_rate_percentile": format_decimal(first["grad_admissions_rate_percentile"]),
            "studentFacultyRatio": format_decimal(first["grad_student_faculty_ratio"]),
            "studentFacultyRatioPercentile": format_decimal(first["grad_student_faculty_ratio_percentile"]),
            "avg_family_income_nslds": format_number(first["grad_avg_family_income_nslds"]),
            "avg_family_income_nslds_percentile": format_decimal(first["grad_avg_family_income_nslds_percentile"]),
            "average_class_size": "",
        },
        "demographics": format_demographics(
            first["grad_gender_data"],
            first["grad_ethnicity_data"],
            first["grad_income_data"],
            first["median_hh_income"],
        ),
        "dept_contents": [],
    }

    seen_depts = set()
    for row in rows:
        cip = row["cip_code"]
        if cip and cip not in seen_depts:
            seen_depts.add(cip)
            dept = {
                "cip": cip,
                "department_name": row["dept_name"],
                "content": "",
                "total_students": format_number(row["dept_total_students"]),
                "total_student_percentile": "",
                "graduation_rate": "",
                "graduation_rate_percentile": "",
                "average_class_size": "",
            }
            undergrad_content["dept_contents"].append(dept)
            grad_content["dept_contents"].append(dept.copy())

    return {
        "id": first["id"],
        "name": first["name"],
        "location": first["location"],
        "studentFacultyRatio": format_decimal(first["student_faculty_ratio"]),
        "icon": first["icon"],
        "isPublic": first["is_public"],
        "sectorScorecard": "",
        "content": {
            "undergrad_content": undergrad_content,
            "grad_content": grad_content,
        },
    }


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────

@ns.route("/universities")
class UniversityList(Resource):
    @ns.doc(
        params={
            "page": {"description": "Page number (1-indexed)", "default": 1},
            "pageSize": {"description": "Results per page", "default": 10},
            "search": {"description": "Search by name or location"},
            "sort": {
                "description": "Sort column",
                "default": "name",
                "enum": list(SORT_MAP.keys()) + list(DEPT_SORT_MAP.keys()),
            },
            "sortDir": {"description": "Sort direction (asc/desc)", "default": "asc"},
            "sortDept": {"description": "CIP code for department-specific sorting"},
            "sector": {
                "description": "Filter by sector",
                "enum": ["public", "private_nonprofit", "private_forprofit"],
            },
            "filterDept": {"description": "CIP code for department-specific min/max filters (required for dept_* filters)"},
            # Institution-level filters
            "min_total_students": {"description": "Minimum total undergraduate students"},
            "max_total_students": {"description": "Maximum total undergraduate students"},
            "min_graduation_rate": {"description": "Minimum graduation rate (0-100)"},
            "max_graduation_rate": {"description": "Maximum graduation rate (0-100)"},
            "min_admissions_rate": {"description": "Minimum admissions rate (0-100)"},
            "max_admissions_rate": {"description": "Maximum admissions rate (0-100)"},
            "min_sat_score": {"description": "Minimum SAT score"},
            "max_sat_score": {"description": "Maximum SAT score"},
            "min_act_score": {"description": "Minimum ACT score"},
            "max_act_score": {"description": "Maximum ACT score"},
            "min_student_faculty_ratio": {"description": "Minimum student-to-faculty ratio"},
            "max_student_faculty_ratio": {"description": "Maximum student-to-faculty ratio"},
            "min_avg_family_income_nslds": {"description": "Minimum average family income (NSLDS)"},
            "max_avg_family_income_nslds": {"description": "Maximum average family income (NSLDS)"},
            "min_tuition_in_state": {"description": "Minimum in-state tuition"},
            "max_tuition_in_state": {"description": "Maximum in-state tuition"},
            "min_tuition_out_state": {"description": "Minimum out-of-state tuition"},
            "max_tuition_out_state": {"description": "Maximum out-of-state tuition"},
            "min_avg_net_price_overall": {"description": "Minimum average net price"},
            "max_avg_net_price_overall": {"description": "Maximum average net price"},
            # Demographic filters (percentages 0-100)
            "min_pct_male": {"description": "Minimum % male (0-100)"},
            "max_pct_male": {"description": "Maximum % male (0-100)"},
            "min_pct_female": {"description": "Minimum % female (0-100)"},
            "max_pct_female": {"description": "Maximum % female (0-100)"},
            "min_pct_white": {"description": "Minimum % White (0-100)"},
            "max_pct_white": {"description": "Maximum % White (0-100)"},
            "min_pct_black": {"description": "Minimum % Black (0-100)"},
            "max_pct_black": {"description": "Maximum % Black (0-100)"},
            "min_pct_hispanic": {"description": "Minimum % Hispanic (0-100)"},
            "max_pct_hispanic": {"description": "Maximum % Hispanic (0-100)"},
            "min_pct_asian": {"description": "Minimum % Asian (0-100)"},
            "max_pct_asian": {"description": "Maximum % Asian (0-100)"},
            "min_pct_aian": {"description": "Minimum % American Indian/Alaska Native (0-100)"},
            "max_pct_aian": {"description": "Maximum % American Indian/Alaska Native (0-100)"},
            "min_pct_nhpi": {"description": "Minimum % Native Hawaiian/Pacific Islander (0-100)"},
            "max_pct_nhpi": {"description": "Maximum % Native Hawaiian/Pacific Islander (0-100)"},
            "min_pct_two_plus": {"description": "Minimum % Two or More Races (0-100)"},
            "max_pct_two_plus": {"description": "Maximum % Two or More Races (0-100)"},
            "min_pct_nra": {"description": "Minimum % Non-resident Alien (0-100)"},
            "max_pct_nra": {"description": "Maximum % Non-resident Alien (0-100)"},
            "min_pct_unknown": {"description": "Minimum % Unknown race (0-100)"},
            "max_pct_unknown": {"description": "Maximum % Unknown race (0-100)"},
            "min_pct_income_low": {"description": "Minimum % family income <$30k (0-100)"},
            "max_pct_income_low": {"description": "Maximum % family income <$30k (0-100)"},
            "min_pct_income_mid1": {"description": "Minimum % family income $30k-$48k (0-100)"},
            "max_pct_income_mid1": {"description": "Maximum % family income $30k-$48k (0-100)"},
            "min_pct_income_mid2": {"description": "Minimum % family income $48k-$75k (0-100)"},
            "max_pct_income_mid2": {"description": "Maximum % family income $48k-$75k (0-100)"},
            "min_pct_income_high1": {"description": "Minimum % family income $75k-$110k (0-100)"},
            "max_pct_income_high1": {"description": "Maximum % family income $75k-$110k (0-100)"},
            "min_pct_income_high2": {"description": "Minimum % family income >$110k (0-100)"},
            "max_pct_income_high2": {"description": "Maximum % family income >$110k (0-100)"},
            # Department-level filters (require filterDept)
            "min_dept_total_students": {"description": "Min dept enrollment (requires filterDept)"},
            "max_dept_total_students": {"description": "Max dept enrollment (requires filterDept)"},
            "min_dept_median_debt": {"description": "Min dept median debt (requires filterDept)"},
            "max_dept_median_debt": {"description": "Max dept median debt (requires filterDept)"},
            "min_dept_median_earnings": {"description": "Min dept median earnings after 4yr (requires filterDept)"},
            "max_dept_median_earnings": {"description": "Max dept median earnings after 4yr (requires filterDept)"},
        }
    )
    def get(self):
        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("pageSize", 10, type=int)
        search = request.args.get("search", "", type=str)
        sort = request.args.get("sort", "name", type=str)
        sort_dir = request.args.get("sortDir", "asc", type=str).upper()
        sort_dept = request.args.get("sortDept", "", type=str)
        sector = request.args.get("sector", "", type=str)
        filter_dept = request.args.get("filterDept", "", type=str)

        if sort_dir not in ("ASC", "DESC"):
            sort_dir = "ASC"
        if sort not in SORT_MAP and sort not in DEPT_SORT_MAP:
            sort = "name"
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        offset = (page - 1) * page_size

        # Build WHERE clause with search, sector, and min/max filters
        where = []

        if search:
            add_condition(where, "(u.name ILIKE %s OR u.location ILIKE %s)",
                       f"%{search}%", f"%{search}%")

        if sector:
            add_condition(where, "u.sector_type = %s", sector)

        parse_filters(where, filter_dept)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                count_query, count_params = build_count_query(where, filter_dept)
                cur.execute(count_query, count_params)
                total = cur.fetchone()[0]

                id_query, id_params = build_id_query(
                    where, sort, sort_dir, sort_dept, filter_dept, page_size, offset
                )
                cur.execute(id_query, id_params)
                ids = [row[0] for row in cur.fetchall()]

                if not ids:
                    return {
                        "universities": [],
                        "total": total,
                        "page": page,
                        "pageSize": page_size,
                    }

                data_query, data_params = build_data_query(ids)
                cur.execute(data_query, data_params)
                columns = [desc[0] for desc in cur.description]
                rows = [dict(zip(columns, row)) for row in cur.fetchall()]

            universities = []
            for _uid, group in groupby(rows, key=lambda r: r["id"]):
                universities.append(format_university(list(group)))

            return {
                "universities": universities,
                "total": total,
                "page": page,
                "pageSize": page_size,
            }
        finally:
            conn.close()


@ns.route("/universities/<int:university_id>")
class UniversityDetail(Resource):
    def get(self, university_id):
        conn = get_db()
        try:
            with conn.cursor() as cur:
                data_query, data_params = build_data_query([university_id])
                cur.execute(data_query, data_params)
                columns = [desc[0] for desc in cur.description]
                rows = [dict(zip(columns, row)) for row in cur.fetchall()]

            if not rows:
                return {"error": "University not found"}, 404

            return format_university(rows)
        finally:
            conn.close()


@ns.route("/stats/aggregates")
class StatsAggregates(Resource):
    @ns.doc(description="Global averages across all universities in the database")
    def get(self):
        """Return national averages for each metric, formatted for display."""
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        ROUND(AVG(us.total_students))::int AS total_students,
                        AVG(us.graduation_rate) AS graduation_rate,
                        AVG(us.admissions_rate) AS admissions_rate,
                        AVG(us.student_faculty_ratio) AS student_faculty_ratio,
                        ROUND(AVG(us.sat_score))::int AS sat_score,
                        ROUND(AVG(us.act_score))::int AS act_score
                    FROM university_undergrad_stats us
                    JOIN universities u ON u.id = us.university_id
                    WHERE u.pred_deg = 3
                    """
                )
                ug_columns = [desc[0] for desc in cur.description]
                ug = dict(zip(ug_columns, cur.fetchone()))

                cur.execute(
                    """
                    SELECT
                        ROUND(AVG(gs.total_students))::int AS total_students,
                        AVG(gs.graduation_rate) AS graduation_rate,
                        AVG(gs.admissions_rate) AS admissions_rate,
                        AVG(gs.student_faculty_ratio) AS student_faculty_ratio
                    FROM university_grad_stats gs
                    JOIN universities u ON u.id = gs.university_id
                    WHERE u.pred_deg = 3
                    """
                )
                gr_columns = [desc[0] for desc in cur.description]
                gr = dict(zip(gr_columns, cur.fetchone()))

                cur.execute(
                    """
                    SELECT ROUND(AVG(ud.median_hh_income))::int AS median_hh_income
                    FROM university_undergrad_demographics ud
                    JOIN universities u ON u.id = ud.university_id
                    WHERE u.pred_deg = 3 AND ud.median_hh_income IS NOT NULL
                    """
                )
                median_hh_income = cur.fetchone()[0]

            return {
                "undergrad": {
                    "totalStudents": format_number(ug["total_students"]),
                    "graduationRate": f"{format_rate(ug['graduation_rate'])}%",
                    "admissionsRate": f"{format_rate(ug['admissions_rate'])}%",
                    "studentFacultyRatio": (
                        f"{ug['student_faculty_ratio']:.1f}:1"
                        if ug["student_faculty_ratio"] is not None else ""
                    ),
                    "medianHouseholdIncome": format_currency(median_hh_income),
                    "satScore": format_number(ug["sat_score"]),
                    "actScore": format_number(ug["act_score"]),
                },
                "grad": {
                    "totalStudents": format_number(gr["total_students"]),
                    "graduationRate": f"{format_rate(gr['graduation_rate'])}%",
                    "admissionsRate": f"{format_rate(gr['admissions_rate'])}%",
                    "studentFacultyRatio": (
                        f"{gr['student_faculty_ratio']:.1f}:1"
                        if gr["student_faculty_ratio"] is not None else ""
                    ),
                    "medianHouseholdIncome": format_currency(median_hh_income),
                },
            }
        finally:
            conn.close()


# ──────────────────────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=8000)
