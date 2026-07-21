-- UniDB Database Schema
-- PostgreSQL

-- ============================================================
-- UNIVERSITIES
-- Core information for each university.
-- ============================================================

CREATE TABLE universities (
    id          SERIAL PRIMARY KEY,
    unit_id     INT UNIQUE,
    name        TEXT NOT NULL,
    location    TEXT NOT NULL,
    website     TEXT,
    is_public   BOOLEAN NOT NULL,
    sector_type TEXT NOT NULL CHECK (sector_type IN (
        'public',
        'private_nonprofit',
        'private_forprofit'
    )),
    icon        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- UNDERGRADUATE STATISTICS
-- One row per university. Fields not applicable to a
-- university are NULL.
-- ============================================================

CREATE TABLE university_undergrad_stats (
    id                              SERIAL PRIMARY KEY,
    university_id                   INT NOT NULL UNIQUE REFERENCES universities(id),
    total_students                  INT,
    total_students_percentile       INT,
    graduation_rate                 NUMERIC(5,2),
    graduation_rate_extended        NUMERIC(5,2),
    graduation_rate_reliable        BOOLEAN,
    graduation_rate_percentile      INT,
    admissions_rate                 NUMERIC(5,2),
    admissions_rate_percentile      INT,
    student_faculty_ratio           NUMERIC(4,1),
    student_faculty_ratio_percentile INT,
    average_class_size              INT,
    avg_household_income            INT,
    avg_household_income_percentile INT,
    sat_score                       INT,
    sat_score_percentile            INT,
    act_score                       INT,
    act_score_percentile            INT,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GRADUATE STATISTICS
-- Same structure as undergrad but without SAT/ACT.
-- ============================================================

CREATE TABLE university_grad_stats (
    id                              SERIAL PRIMARY KEY,
    university_id                   INT NOT NULL UNIQUE REFERENCES universities(id),
    total_students                  INT,
    total_students_percentile       INT,
    graduation_rate                 NUMERIC(5,2),
    graduation_rate_extended        NUMERIC(5,2),
    graduation_rate_reliable        BOOLEAN,
    graduation_rate_percentile      INT,
    admissions_rate                 NUMERIC(5,2),
    admissions_rate_percentile      INT,
    student_faculty_ratio           NUMERIC(4,1),
    student_faculty_ratio_percentile INT,
    average_class_size              INT,
    avg_household_income            INT,
    avg_household_income_percentile INT,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DEMOGRAPHICS
-- JSONB columns hold arrays of {name, value} objects.
-- One row per university.
-- ============================================================

CREATE TABLE university_undergrad_demographics (
    id              SERIAL PRIMARY KEY,
    university_id   INT NOT NULL UNIQUE REFERENCES universities(id),
    gender_data     JSONB,
    ethnicity_data  JSONB,
    income_data     JSONB
);

CREATE TABLE university_grad_demographics (
    id              SERIAL PRIMARY KEY,
    university_id   INT NOT NULL UNIQUE REFERENCES universities(id),
    gender_data     JSONB,
    ethnicity_data  JSONB,
    income_data     JSONB
);

-- ============================================================
-- COST & AID
-- One row per university. Bracket-level breakdowns use JSONB.
-- ============================================================

CREATE TABLE university_cost_aid (
    id                      SERIAL PRIMARY KEY,
    university_id           INT NOT NULL UNIQUE REFERENCES universities(id),
    tuition_in_state        INT,
    tuition_out_state       INT,
    room_board              INT,
    avg_grantaid            INT,
    avg_net_price_overall   INT,
    avg_net_price_by_income JSONB,
    median_debt_overall     INT,
    median_debt_by_income   JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DEPARTMENTS
-- Central registry of departments across all universities.
-- Each row ties a university to a CIP field classification.
-- UNIQUE(university_id, cip_code) enforces one dept per
-- CIP field per university.
-- ============================================================

CREATE TABLE departments (
    id              SERIAL PRIMARY KEY,
    university_id   INT NOT NULL REFERENCES universities(id),
    cip_code        TEXT NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    UNIQUE (university_id, cip_code)
);

-- ============================================================
-- DEPARTMENT UNDERGRADUATE STATISTICS
-- Per-department metrics for undergraduate programs.
-- total_students is estimated from Field of Study awards:
--   (field_awards / total_awards_at_level) × UGDS
-- ============================================================

CREATE TABLE department_undergrad_statistics (
    id              SERIAL PRIMARY KEY,
    department_id   INT NOT NULL UNIQUE REFERENCES departments(id),
    total_students  INT,
    total_awards    INT,
    median_debt     INT,
    median_earnings_4yr INT
);

-- ============================================================
-- DEPARTMENT GRADUATE STATISTICS
-- Per-department metrics for graduate programs.
-- (Currently not imported - estimation approach needs review)
-- ============================================================

CREATE TABLE department_grad_statistics (
    id              SERIAL PRIMARY KEY,
    department_id   INT NOT NULL UNIQUE REFERENCES departments(id),
    total_students  INT,
    total_awards    INT,
    median_debt     INT,
    median_earnings_4yr INT
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_location ON universities(location);
CREATE INDEX idx_universities_sector ON universities(sector_type);

CREATE INDEX idx_undergrad_university ON university_undergrad_stats(university_id);
CREATE INDEX idx_grad_university ON university_grad_stats(university_id);

CREATE INDEX idx_undergrad_demographics_university ON university_undergrad_demographics(university_id);
CREATE INDEX idx_grad_demographics_university ON university_grad_demographics(university_id);
CREATE INDEX idx_cost_aid_university ON university_cost_aid(university_id);

CREATE INDEX idx_departments_university ON departments(university_id);
CREATE INDEX idx_departments_cip ON departments(cip_code);
CREATE INDEX idx_dept_undergrad_stats_department ON department_undergrad_statistics(department_id);
CREATE INDEX idx_dept_grad_stats_department ON department_grad_statistics(department_id);
