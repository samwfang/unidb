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


# ──────────────────────────────────────────────────────────────
# Sort Maps
# ──────────────────────────────────────────────────────────────

SORT_MAP = {
    "name": "u.name",
    "location": "u.location",
    "total_students": "us.total_students",
    "graduation_rate": "us.graduation_rate",
    "admissions_rate": "us.admissions_rate",
    "sat_score": "us.sat_score",
    "act_score": "us.act_score",
    "average_class_size": "us.student_faculty_ratio",
    "student_faculty_ratio": "us.student_faculty_ratio",
    "avg_household_income": "us.avg_household_income",
    "tuition_in_state": "ca.tuition_in_state",
    "tuition_out_state": "ca.tuition_out_state",
    "avg_net_price_overall": "ca.avg_net_price_overall",
}

DEPT_SORT_MAP = {
    "total_students": "dus_sort.total_students",
    "total_awards": "dus_sort.total_awards",
    "median_debt": "dus_sort.median_debt",
    "median_earnings": "dus_sort.median_earnings_4yr",
}


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def format_number(value):
    if value is None:
        return None
    return f"{int(value):,}"


def format_decimal(value):
    if value is None:
        return None
    return str(value)


def format_rate(value):
    if value is None:
        return None
    return str(int(round(value * 100)))


def parse_jsonb(value):
    if value is None:
        return None
    if isinstance(value, str):
        return json.loads(value)
    return value


# ──────────────────────────────────────────────────────────────
# Query Builders
# ──────────────────────────────────────────────────────────────

def build_count_query(search, sector):
    conditions = []
    params = []

    if search:
        conditions.append("(u.name ILIKE %s OR u.location ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])

    if sector:
        conditions.append("u.sector_type = %s")
        params.append(sector)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    return f"SELECT COUNT(*) FROM universities u {where}", params


def build_id_query(search, sector, sort_col, sort_dir, sort_dept, limit, offset):
    conditions = []
    params = []

    if search:
        conditions.append("(u.name ILIKE %s OR u.location ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])

    if sector:
        conditions.append("u.sector_type = %s")
        params.append(sector)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    order = "u.name ASC"
    if sort_dept and sort_col in DEPT_SORT_MAP:
        order = f"{DEPT_SORT_MAP[sort_col]} {sort_dir} NULLS LAST"
    elif sort_col in SORT_MAP:
        order = f"{SORT_MAP[sort_col]} {sort_dir} NULLS LAST"

    query = f"""
        SELECT u.id
        FROM universities u
        LEFT JOIN university_undergrad_stats us ON us.university_id = u.id
        LEFT JOIN university_cost_aid ca ON ca.university_id = u.id
        LEFT JOIN departments d_sort
            ON d_sort.university_id = u.id AND d_sort.cip_code = %s
        LEFT JOIN department_undergrad_statistics dus_sort
            ON dus_sort.department_id = d_sort.id
        {where}
        ORDER BY {order}
        LIMIT %s OFFSET %s
    """

    params = [sort_dept or ""] + params + [limit, offset]
    return query, params


def build_data_query(ids):
    query = """
        SELECT
            u.id, u.unit_id, u.name, u.location, u.website,
            u.is_public, u.sector_type, u.icon,
            us.total_students, us.graduation_rate, us.graduation_rate_reliable,
            us.admissions_rate, us.student_faculty_ratio, us.avg_household_income,
            us.sat_score, us.act_score,
            gs.total_students AS grad_total_students,
            gs.graduation_rate AS grad_graduation_rate,
            gs.graduation_rate_reliable AS grad_graduation_rate_reliable,
            gs.admissions_rate AS grad_admissions_rate,
            gs.student_faculty_ratio AS grad_student_faculty_ratio,
            gs.avg_household_income AS grad_avg_household_income,
            ud.gender_data, ud.ethnicity_data, ud.income_data,
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
        ORDER BY u.id, d.cip_code
    """
    return query, [ids]


# ──────────────────────────────────────────────────────────────
# Response Formatting
# ──────────────────────────────────────────────────────────────

def format_demographics(gender_data, ethnicity_data, income_data):
    return {
        "gender": parse_jsonb(gender_data) or [],
        "ethnicity": parse_jsonb(ethnicity_data) or [],
        "income": parse_jsonb(income_data) or [],
    }


def format_university(rows):
    if not rows:
        return None

    first = rows[0]

    undergrad_content = {
        "general_content": {
            "total_students": format_number(first["total_students"]),
            "total_student_percentile": None,
            "graduation_rate": format_rate(first["graduation_rate"]),
            "graduation_rate_percentile": None,
            "admissions_rate": format_rate(first["admissions_rate"]),
            "admissions_rate_percentile": None,
            "sat_score": format_number(first["sat_score"]),
            "act_score": str(first["act_score"]) if first["act_score"] else None,
            "studentFacultyRatio": format_decimal(first["student_faculty_ratio"]),
            "studentFacultyRatioPercentile": None,
            "avg_household_income": format_number(first["avg_household_income"]),
            "avg_household_income_percentile": None,
            "average_class_size": None,
        },
        "demographics": format_demographics(
            first["gender_data"], first["ethnicity_data"], first["income_data"]
        ),
        "dept_contents": [],
    }

    grad_content = {
        "general_content": {
            "total_students": format_number(first["grad_total_students"]),
            "total_student_percentile": None,
            "graduation_rate": format_rate(first["grad_graduation_rate"]),
            "graduation_rate_percentile": None,
            "admissions_rate": format_rate(first["grad_admissions_rate"]),
            "admissions_rate_percentile": None,
            "studentFacultyRatio": format_decimal(first["grad_student_faculty_ratio"]),
            "avg_household_income": format_number(first["grad_avg_household_income"]),
            "avg_household_income_percentile": None,
            "average_class_size": None,
        },
        "demographics": format_demographics(
            first["grad_gender_data"],
            first["grad_ethnicity_data"],
            first["grad_income_data"],
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
                "total_student_percentile": None,
                "graduation_rate": None,
                "graduation_rate_percentile": None,
                "average_class_size": None,
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
        "sectorScorecard": None,
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

        if sort_dir not in ("ASC", "DESC"):
            sort_dir = "ASC"
        if sort not in SORT_MAP and sort not in DEPT_SORT_MAP:
            sort = "name"
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        offset = (page - 1) * page_size

        conn = get_db()
        try:
            with conn.cursor() as cur:
                count_query, count_params = build_count_query(search, sector)
                cur.execute(count_query, count_params)
                total = cur.fetchone()[0]

                id_query, id_params = build_id_query(
                    search, sector, sort, sort_dir, sort_dept, page_size, offset
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


# ──────────────────────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=8000)
