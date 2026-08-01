export enum ModeType {
  Undergrad = 'undergrad',
  Grad = 'grad',
  Law = 'law'
}

// Top level entry for University Data
export interface UniversityData {
  id: number;
  name: string;
  location: string;
  studentFacultyRatio: string;
  icon: string;
  isPublic?: boolean;
  sectorScorecard?: number;
  content?: Content;
}

//Content to Render on Entry Expansion
export interface Content {
  undergrad_content?: UndergradContent;
  grad_content?: GradContent;
};

export interface DemographicsData {
  gender: Array<{ name: string; value: number }>;
  ethnicity: Array<{ name: string; value: number }>;
  income: Array<{ name: string; value: number }>;
}

//Content for Undergrad
export interface UndergradContent {
  general_content: {
    total_students: string;
    total_student_percentile: string;

    graduation_rate: string;
    graduation_rate_percentile: string;

    admissions_rate: string;
    admissions_rate_percentile: string;

    sat_score?: string;
    act_score?: string;
    sat_score_percentile?: string;
    act_score_percentile?: string;

    studentFacultyRatio?: string;
    studentFacultyRatioPercentile?: string;

    avg_household_income?: string;
    avg_household_income_percentile?: string;

    average_class_size: string;
  };
  demographics?: DemographicsData;
  dept_contents?: UGradDeptContent[];
};

//Content for each Department in the Undergrad Program
export interface UGradDeptContent {
  cip: string,
  department_name: string;
  content: string;
  total_students?: string;
  total_student_percentile?: string;
  graduation_rate?: string;
  graduation_rate_percentile?: string;
  average_class_size?: string;
};

//Content for Grad
export interface GradContent {
  general_content: {
    total_students: string;
    total_student_percentile: string;
    graduation_rate: string;
    graduation_rate_percentile?: string;
    admissions_rate?: string;
    admissions_rate_percentile?: string;
    average_class_size: string;

    avg_household_income?: string;
    avg_household_income_percentile?: string;

    studentFacultyRatio?: string;
    studentFacultyRatioPercentile?: string;
  };
  demographics?: DemographicsData;
  dept_contents?: GradDeptContent[];
}

//Content for each Department in the Grad Program
export interface GradDeptContent {
  cip: string,
  department_name: string;
  content: string;
  total_students?: string;
  total_student_percentile?: string;
  graduation_rate?: string;
  graduation_rate_percentile?: string;
  average_class_size?: string;
};