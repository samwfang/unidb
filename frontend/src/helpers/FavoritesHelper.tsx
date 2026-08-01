import { ColumnType, ExtraSortType, SortType } from './DepartmentHelper';
import { ModeType, UniversityData, UndergradContent, GradContent } from './types';

//Parses a display-formatted value ("1,234", "95", "14.5") into a number;
//returns null for missing/empty values (matches the API's NULLS LAST behavior).
const parseDisplayNumber = (value?: string): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned || isNaN(Number(cleaned))) return null;
  return Number(cleaned);
};

//Extracts the raw numeric value used for sorting, mirroring getColumnData but
//returning parseable numbers instead of display-formatted strings.
const getRawValue = (
  item: UniversityData,
  columnType: ColumnType,
  mode: ModeType,
  sortDept: string
): number | null => {
  const content: UndergradContent | GradContent | undefined =
    mode === ModeType.Undergrad ? item.content?.undergrad_content : item.content?.grad_content;

  if (sortDept && sortDept !== 'general') {
    const dept = content?.dept_contents?.find((d) => d.cip === sortDept);
    if (!dept) return null;
    switch (columnType) {
      case ColumnType.TotalStudents:
        return parseDisplayNumber(dept.total_students);
      case ColumnType.GraduationRate:
        return parseDisplayNumber(dept.graduation_rate);
      default:
        return null;
    }
  }

  const general = content?.general_content;
  switch (columnType) {
    case ColumnType.TotalStudents:
      return parseDisplayNumber(general?.total_students);
    case ColumnType.GraduationRate:
      return parseDisplayNumber(general?.graduation_rate);
    case ColumnType.StudentFacultyRatio:
      return parseDisplayNumber((general as any)?.studentFacultyRatio);
    case ColumnType.SATScore:
      return parseDisplayNumber((general as any)?.sat_score);
    case ColumnType.ACTScore:
      return parseDisplayNumber((general as any)?.act_score);
    case ColumnType.AdmissionsRate:
      return parseDisplayNumber(general?.admissions_rate);
    case ColumnType.HouseholdIncome:
      return parseDisplayNumber(general?.avg_household_income);
    default:
      return null;
  }
};

//Replicates the API's sort semantics for client-side favorites sorting:
//name asc/desc for alphabetical, numeric with NULLS LAST and u.id tiebreaker.
export const compareFavorites = (
  a: UniversityData,
  b: UniversityData,
  sort: SortType,
  sortDept: string,
  sortExtra: string,
  mode: ModeType
): number => {
  if (sort === ExtraSortType.Alphabetical || sort === ExtraSortType.ReverseAlphabetical) {
    const cmp = a.name.localeCompare(b.name);
    return sort === ExtraSortType.Alphabetical ? cmp : -cmp;
  }

  const va = getRawValue(a, sort as ColumnType, mode, sortDept);
  const vb = getRawValue(b, sort as ColumnType, mode, sortDept);

  if (va === null && vb === null) return a.id - b.id;
  if (va === null) return 1; // NULLS LAST
  if (vb === null) return -1;

  const cmp = va - vb;
  return (sortExtra === 'least' ? cmp : -cmp) || a.id - b.id;
};
