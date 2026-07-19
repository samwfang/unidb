# College Scorecard → uniDB Column Mapping

Source: `CollegeScorecardDataDictionary.xlsx`, sheet `Institution_Data_Dictionary`

Each Scorecard variable is listed with its CSV column name, a plain-language description, and the Python variable name used in `import.py`. Where a direct match to a schema column exists, it is noted.

---

## `universities`

| CSV Column | Description | Python Var | Schema Column |
|---|---|---|---|
| `UNITID` | Unique ID for each institution (IPEDS) | `unit_id` | `id` (managed by SERIAL) |
| `INSTNM` | Institution name | `name` | `name` |
| `CITY` + `STABBR` | City and state postcode, combined as "City, ST" | `location` | `location` |
| `INSTURL` | URL for institution's homepage | `website` | `website` |
| `CONTROL` | Control of institution: 1 = Public, 2 = Private nonprofit, 3 = Private for-profit | `control` | `is_public` (BOOLEAN) + `sector_type` (TEXT) |

**Notes:**
- `CONTROL` is mapped to two schema columns: `is_public` is `True` when `CONTROL = 1`, and `sector_type` is the string (`'public'`, `'private_nonprofit'`, `'private_forprofit'`).
- `UNITID` is used as the link between all tables but is not stored as a schema column — the schema uses `SERIAL` id. The import script should look up or insert by `UNITID` and use the resulting `university_id`.

---

## `university_undergrad_stats`

| CSV Column | Description | Python Var | Schema Column |
|---|---|---|---|
| `UGDS` | Enrollment of undergraduate certificate/degree-seeking students | `total_students` | `total_students` |
| — | *Computed at import time* | `total_students_percentile` | `total_students_percentile` |
| `C150_4` | Graduation rate for first-time, full-time students at 4-year institutions (150% of expected time) | `graduation_rate` | `graduation_rate` |
| — | *Computed at import time* | `graduation_rate_percentile` | `graduation_rate_percentile` |
| `ADM_RATE` | Admission rate (percent of applicants admitted) | `admissions_rate` | `admissions_rate` |
| — | *Computed at import time* | `admissions_rate_percentile` | `admissions_rate_percentile` |
| `STUFACR` | Undergraduate student-to-instructional-faculty ratio | `student_faculty_ratio` | `student_faculty_ratio` |
| — | *Computed at import time* | `student_faculty_ratio_percentile` | `student_faculty_ratio_percentile` |
| — | *Not available in Scorecard data* | `average_class_size` | `average_class_size` |
| `FAMINC` | Average family income of students | `avg_household_income` | `avg_household_income` |
| — | *Computed at import time* | `avg_household_income_percentile` | `avg_household_income_percentile` |
| `SATVRMID` + `SATMTMID` | 50th percentile of SAT scores (critical reading + math), summed | `sat_score` | `sat_score` |
| — | *Computed at import time* | `sat_score_percentile` | `sat_score_percentile` |
| `ACTCM50` | 50th percentile of the ACT cumulative score | `act_score` | `act_score` |
| — | *Computed at import time* | `act_score_percentile` | `act_score_percentile` |

**Notes on Scorecard variable names:**
- `ADM_RATE` is the standard variable. Use `ADM_RATE_SUPP` (suppressed for n<30) as a fallback.
- SAT score is not a single field in Scorecard — `SATVRMID` (verbal/reading) and `SATMTMID` (math) must be summed.
- ACT composite score: `ACTCM50`. Additional ACT sub-scores available: `ACTEN50` (English), `ACTMT50` (math).
- Percentile columns (`*_percentile`) are not in the Scorecard — they must be computed from the full dataset at import time.

---

## `university_grad_stats`

| CSV Column | Description | Python Var | Schema Column |
|---|---|---|---|
| `GRADS` | Number of graduate students | `total_students` | `total_students` |
| — | *Computed at import time* | `total_students_percentile` | `total_students_percentile` |
| `C150_4_RAN` or `OMAWDP8_RAN` | Graduate graduation/completion rate (varies by cohort) | `graduation_rate` | `graduation_rate` |
| — | *Computed at import time* | `graduation_rate_percentile` | `graduation_rate_percentile` |
| `ADM_RATE` | Admission rate (same as undergrad — institution-level) | `admissions_rate` | `admissions_rate` |
| — | *Computed at import time* | `admissions_rate_percentile` | `admissions_rate_percentile` |
| `STUFACR` | Student-to-faculty ratio (institution-level, shared with undergrad) | `student_faculty_ratio` | `student_faculty_ratio` |
| — | *Computed at import time* | `student_faculty_ratio_percentile` | `student_faculty_ratio_percentile` |
| — | *Not available in Scorecard data* | `average_class_size` | `average_class_size` |
| `MD_FAMINC` or `FAMINC` | Median or average family income | `avg_household_income` | `avg_household_income` |
| — | *Computed at import time* | `avg_household_income_percentile` | `avg_household_income_percentile` |

**Notes:**
- Scorecard does not have separate grad-only admissions rates or student-faculty ratios — these are institution-level. If both undergrad and grad stats share the same value, import the same number into both tables.
- `GRADS` is the graduate enrollment count.

---

## `university_undergrad_demographics`

These JSONB columns store arrays of `{"name": "...", "value": N}` objects. The Scorecard provides individual percentage fields that must be assembled into JSONB arrays.

### `gender_data`

Assemble from:

| CSV Column | Description | Python Var | JSONB Name |
|---|---|---|---|
| `UGDS_MEN` | Share of undergraduate degree-seeking students who are men | `pct_male` | `"Male"` |
| `UGDS_WOMEN` | Share of undergraduate degree-seeking students who are women | `pct_female` | `"Female"` |

*Values are decimals (0.0–1.0) — multiply by 100 for percentage display.*

### `ethnicity_data`

Assemble from:

| CSV Column | Description | Python Var | JSONB Name |
|---|---|---|---|
| `UGDS_WHITE` | Share of undergraduate degree-seeking students who are White | `pct_white` | `"White"` |
| `UGDS_BLACK` | Share of undergraduate degree-seeking students who are Black | `pct_black` | `"Black"` |
| `UGDS_HISP` | Share of undergraduate degree-seeking students who are Hispanic | `pct_hispanic` | `"Hispanic"` |
| `UGDS_ASIAN` | Share of undergraduate degree-seeking students who are Asian | `pct_asian` | `"Asian"` |
| `UGDS_AIAN` | Share of undergraduate degree-seeking students who are American Indian/Alaska Native | `pct_aian` | `"American Indian"` |
| `UGDS_NHPI` | Share of undergraduate degree-seeking students who are Native Hawaiian/Pacific Islander | `pct_nhpi` | `"Native Hawaiian/Pacific Islander"` |
| `UGDS_2MOR` | Share of undergraduate degree-seeking students who are Two or More Races | `pct_two_plus` | `"Two or More Races"` |
| `UGDS_NRA` | Share of undergraduate degree-seeking students who are non-resident aliens | `pct_nra` | `"Non-resident Alien"` |
| `UGDS_UNKN` | Share of undergraduate degree-seeking students whose race is unknown | `pct_unknown` | `"Unknown"` |

### `income_data`

Assemble from:

| CSV Column | Description | Python Var | JSONB Name |
|---|---|---|---|
| `INC_PCT_LO` | Percentage of aided students with family income $0–$30,000 | `pct_income_low` | `"<$30k"` |
| `INC_PCT_M1` | Percentage of aided students with family income $30,001–$48,000 | `pct_income_mid1` | `"$30k-$48k"` |
| `INC_PCT_M2` | Percentage of aided students with family income $48,001–$75,000 | `pct_income_mid2` | `"$48k-$75k"` |
| `INC_PCT_H1` | Percentage of aided students with family income $75,001–$110,000 | `pct_income_high1` | `"$75k-$110k"` |
| `INC_PCT_H2` | Percentage of aided students with family income $110,001+ | `pct_income_high2` | `">$110k"` |

*Values are decimals (0.0–1.0) — multiply by 100 for percentage display.*

---

## `university_grad_demographics`

Same structure as undergrad demographics. The Scorecard does not provide separate graduate demographic breakdowns in the institution-level data, so these would need to come from a different source or be left NULL.

---

## `university_cost_aid`

| CSV Column | Description | Python Var | Schema Column |
|---|---|---|---|
| `TUITIONFEE_IN` | Tuition In-State | `tuition_in_state` | `tuition_in_state` (approximation) |
| `TUITIONFEE_OUT` | Tuition Out-Of-State | `tuition_out_state` | `tuition_out_state` |
| — | *Not available in Scorecard data* | `room_board` | `room_board` |
| `PCTPELL` | Percentage of students receiving a Pell Grant | `pct_pell` | *(not in schema — use for `avg_grantaid` context)* |
| `PCTFLOAN` | Percentage of students receiving a federal loan | `pct_federal_loan` | *(not in schema)* |
| `AVGFACSAL` | Average faculty salary | `avg_faculty_salary` | *(not in schema — could extend)* |
| `TUITFTE` | Net tuition revenue per full-time equivalent student | `avg_net_price_overall` | `avg_net_price_overall` (approximation) |
| — | *Not available in Scorecard data* | `median_debt_overall` | `median_debt_overall` |

**Notes:**
- Scorecard's cost data is limited at the institution level. Full tuition/fee data is in other Scorecard tables or external sources (e.g., IPEDS Finance).
- `avg_net_price_by_income` and `median_debt_by_income` are JSONB — populated from Scorecard variables like `INC_PCT_*` or from supplemental data.

---

## Additional Useful Variables (Future Expansion)

These Scorecard variables are not currently in the schema but could be added as new columns or tables later.

### School / Identity

| CSV Column | Description | Python Var |
|---|---|---|
| `OPEID` | 8-digit OPE ID for institution | `ope_id` |
| `OPEID6` | 6-digit OPE ID for institution | `ope_id_6` |
| `FEDSCHCD` | Federal School Code | `federal_school_code` |
| `ADDR` | Street address of institution | `address` |
| `ZIP` | ZIP code | `zip_code` |
| `ST_FIPS` | FIPS code for state | `state_fips` |
| `REGION` | IPEDS region code | `region` |
| `LOCALE` | Locale of institution (city, suburb, town, rural) | `locale` |
| `CCBASIC` | Carnegie Classification — basic | `carnegie_basic` |
| `CCUGPROF` | Carnegie Classification — undergraduate profile | `carnegie_ug_profile` |
| `CCSIZSET` | Carnegie Classification — size and setting | `carnegie_size_setting` |
| `HBCU` | Flag for Historically Black College and University | `is_hbcu` |
| `HSI` | Flag for Hispanic-serving institution | `is_hsi` |
| `TRIBAL` | Flag for tribal college and university | `is_tribal` |
| `PBI` | Flag for predominantly black institution | `is_pbi` |
| `ANNHI` | Flag for Alaska Native/Native Hawaiian serving institution | `is_annhi` |
| `AANAPII` | Flag for Asian American/Native American/Pacific Islander-serving | `is_aanapii` |
| `MENONLY` | Flag for men-only college | `is_men_only` |
| `WOMENONLY` | Flag for women-only college | `is_women_only` |
| `MAIN` | Flag for main campus | `is_main_campus` |
| `CURROPER` | Currently operating (0 = closed, 1 = operating) | `is_operating` |
| `PREDDEG` | Predominant undergraduate degree awarded | `predominant_degree` |
| `HIGHDEG` | Highest degree awarded | `highest_degree` |
| `ICLEVEL` | Level of institution | `institutional_level` |
| `NUMBRANCH` | Number of branch campuses | `num_branches` |
| `OPENADMP` | Open admissions policy indicator | `open_admissions` |
| `RELAFFIL` | Religious affiliation of the institution | `religious_affiliation` |

### Student Demographics & Enrollment

| CSV Column | Description | Python Var |
|---|---|---|
| `UG` | Enrollment of all undergraduate students | `enrollment_all_ug` |
| `UG12MN` | Unduplicated count of undergrads enrolled during 12-month period | `enrollment_ug_12mo` |
| `G12MN` | Unduplicated count of grad students enrolled during 12-month period | `enrollment_grad_12mo` |
| `UGNONDS` | Number of non-degree-seeking undergraduate students | `enrollment_ug_nondegree` |
| `UG25ABV` | Percentage of undergraduates aged 25 and above | `pct_ug_over_25` |
| `AGE_ENTRY` | Average age of entry | `avg_entry_age` |
| `AGEGE24` | Percent of students over 23 at entry | `pct_over_23_at_entry` |
| `RET_FT4` | First-time, full-time student retention rate (4-year institutions) | `retention_rate_ft_4yr` |
| `RET_FTL4` | First-time, full-time student retention rate (<4-year institutions) | `retention_rate_ft_lt4yr` |
| `PFTFTUG1_EF` | Share of entering undergrads who are first-time, full-time | `pct_first_time_ft` |
| `PPTUG_EF` | Share of undergrads who are part-time | `pct_part_time` |
| `PFTFAC` | Proportion of faculty that is full-time | `pct_faculty_full_time` |
| `DEPENDENT` | Share of dependent students | `pct_dependent` |
| `FEMALE` | Share of female students | `pct_female_overall` |
| `MARRIED` | Share of married students | `pct_married` |
| `VETERAN` | Share of veteran students | `pct_veteran` |
| `FIRST_GEN` | Share of first-generation students | `pct_first_gen` |
| `PELL_EVER` | Share of students who received a Pell Grant | `pct_pell_ever` |

### Family Income (Detailed)

| CSV Column | Description | Python Var |
|---|---|---|
| `DEP_INC_AVG` | Average family income of dependent students (real 2015 dollars) | `dep_avg_income` |
| `IND_INC_AVG` | Average family income of independent students (real 2015 dollars) | `ind_avg_income` |
| `DEP_INC_PCT_LO` | Dependent students with family income $0–$30,000 | `dep_pct_income_lo` |
| `DEP_INC_PCT_M1` | Dependent students with family income $30,001–$48,000 | `dep_pct_income_m1` |
| `DEP_INC_PCT_M2` | Dependent students with family income $48,001–$75,000 | `dep_pct_income_m2` |
| `DEP_INC_PCT_H1` | Dependent students with family income $75,001–$110,000 | `dep_pct_income_h1` |
| `DEP_INC_PCT_H2` | Dependent students with family income $110,001+ | `dep_pct_income_h2` |
| `IND_INC_PCT_LO` | Independent students with family income $0–$30,000 | `ind_pct_income_lo` |
| `IND_INC_PCT_M1` | Independent students with family income $30,001–$48,000 | `ind_pct_income_m1` |
| `IND_INC_PCT_M2` | Independent students with family income $48,001–$75,000 | `ind_pct_income_m2` |
| `IND_INC_PCT_H1` | Independent students with family income $75,001–$110,000 | `ind_pct_income_h1` |
| `IND_INC_PCT_H2` | Independent students with family income $110,001+ | `ind_pct_income_h2` |

### Faculty Demographics

| CSV Column | Description | Python Var |
|---|---|---|
| `IRPS_WHITE` | Share of full-time faculty who are White | `faculty_pct_white` |
| `IRPS_BLACK` | Share of full-time faculty who are Black | `faculty_pct_black` |
| `IRPS_HISP` | Share of full-time faculty who are Hispanic | `faculty_pct_hispanic` |
| `IRPS_ASIAN` | Share of full-time faculty who are Asian | `faculty_pct_asian` |
| `IRPS_AIAN` | Share of full-time faculty who are American Indian/Alaska Native | `faculty_pct_aian` |
| `IRPS_NHPI` | Share of full-time faculty who are Native Hawaiian/Pacific Islander | `faculty_pct_nhpi` |
| `IRPS_2MOR` | Share of full-time faculty who are Two or More Races | `faculty_pct_two_plus` |
| `IRPS_NRA` | Share of full-time faculty who are U.S. Nonresidents | `faculty_pct_nra` |
| `IRPS_UNKN` | Share of full-time faculty of unknown race/ethnicity | `faculty_pct_unknown` |
| `IRPS_WOMEN` | Share of full-time faculty who are women | `faculty_pct_women` |
| `IRPS_MEN` | Share of full-time faculty who are men | `faculty_pct_men` |

### Financial / Aid

| CSV Column | Description | Python Var |
|---|---|---|
| `TUITFTE` | Net tuition revenue per FTE student | `tuition_per_fte` |
| `INEXPFTE` | Instructional expenditures per FTE student | `instructional_spend_per_fte` |
| `AVGFACSAL` | Average faculty salary | `avg_faculty_salary` |
| `ENDOWBEGIN` | Endowment value at beginning of fiscal year | `endowment_begin` |
| `ENDOWEND` | Endowment value at end of fiscal year | `endowment_end` |
| `PCTPELL` | Percentage of students receiving a Pell Grant | `pct_pell` |
| `PCTFLOAN` | Percentage of students receiving a federal loan | `pct_federal_loan` |
| `PCTPELL_DCS` | Percentage of degree/cert-seeking undergrads receiving a Pell Grant | `pct_pell_dcs` |
| `PCTFLOAN_DCS` | Percentage of degree/cert-seeking undergrads receiving a federal loan | `pct_federal_loan_dcs` |

### Neighborhood / Census Context

| CSV Column | Description | Python Var |
|---|---|---|
| `MEDIAN_HH_INC` | Median household income (students' zip codes) | `median_hh_income_zip` |
| `POVERTY_RATE` | Poverty rate (students' zip codes) | `poverty_rate_zip` |
| `UNEMP_RATE` | Unemployment rate (students' zip codes) | `unemployment_rate_zip` |
| `PCT_WHITE` | % White population in students' zip codes | `zip_pct_white` |
| `PCT_BLACK` | % Black population in students' zip codes | `zip_pct_black` |
| `PCT_ASIAN` | % Asian population in students' zip codes | `zip_pct_asian` |
| `PCT_HISPANIC` | % Hispanic population in students' zip codes | `zip_pct_hispanic` |
| `PCT_BA` | % of population (25+) with bachelor's degree in students' zip codes | `zip_pct_ba` |
| `PCT_BORN_US` | % of population born in US in students' zip codes | `zip_pct_born_us` |
