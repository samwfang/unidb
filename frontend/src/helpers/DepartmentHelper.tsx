import { ModeType } from "../helpers/types";
import { GradContent, GradDeptContent, UGradDeptContent, UndergradContent, UniversityData } from "../helpers/types";


// Column Types
// To Add a new Column Type: Add to Enum, Add to MetaDataMap, add to get column data

export enum ColumnType {
  Location = "location",
  TotalStudents = "total_students",
  GraduationRate = "graduation_rate",
  StudentFacultyRatio = "student_faculty_ratio",
  SATScore = "sat_score",
  ACTScore = "act_score",
  AdmissionsRate = "admissions_rate",
  HouseholdIncome = "avg_household_income"
}

export enum ExtraSortType {
  Alphabetical = "a-z",
  ReverseAlphabetical = "z-a",
}

// types for sorting include all columns alongside other extra options
export type SortType = ColumnType | ExtraSortType;

interface ColumnMetadata {
  //name that shows up in GUI
  displayName: string;
  //whether column type only shows up in General or whether Department-Specific content exists for column
  departmentSpecificAllowed: boolean;
  description: string;
  //optionally restrict column to only undergrad or grad mode
  allowedModes?: ModeType[];
}

export const ColumnMetadataMap: Record<ColumnType, ColumnMetadata> = {
  [ColumnType.Location]: {
    displayName: "Location",
    departmentSpecificAllowed: false,
    description: "The geographical location of this institution."
  },
  [ColumnType.TotalStudents]: {
    displayName: "Total Students",
    departmentSpecificAllowed: true,
    description: "The number of students at this institution or department."
  },
  [ColumnType.GraduationRate]: {
    displayName: "Graduation Rate",
    departmentSpecificAllowed: true,
    description: "The graduation rate of students at this institution or department."
  },
  [ColumnType.StudentFacultyRatio]: {
    displayName: "Student Faculty Ratio",
    departmentSpecificAllowed: true,
    description: "The ratio of students to faculty members at this institution or department."
  },
  [ColumnType.SATScore]: {
    displayName: "SAT Score",
    departmentSpecificAllowed: false,
    description: "The average SAT score of admitted students.",
    allowedModes: [ModeType.Undergrad] 
  },
  [ColumnType.ACTScore]: {
    displayName: "ACT Score",
    departmentSpecificAllowed: false,
    description: "The average ACT score of admitted students.",
    allowedModes: [ModeType.Undergrad] 
  },
  [ColumnType.AdmissionsRate]: {
    displayName: "Admissions Rate",
    departmentSpecificAllowed: false,
    description: "The percentage of applicants who are admitted."
  },
  [ColumnType.HouseholdIncome]: {
    displayName: "Avg. Income",
    departmentSpecificAllowed: false,
    description: "The average household income of students."
  }
  // ... other columns
};


// Return String for Column Display Name
export const getColumnDisplayName = (columnType: ColumnType): string => {
  return ColumnMetadataMap[columnType]?.displayName || "Unknown";
};

export const canBeDepartmentColumn = (columnType: ColumnType): boolean => {
  return ColumnMetadataMap[columnType]?.departmentSpecificAllowed || false;
};

export const getColumnDescription = (columnType: ColumnType): string => {
  return ColumnMetadataMap[columnType]?.description || "";
};

export const isColumnAllowedForMode = (columnType: ColumnType, mode: ModeType): boolean => {
  const metadata = ColumnMetadataMap[columnType];
  if (!metadata.allowedModes) {
    return true; // No restrictions
  }
  return metadata.allowedModes.includes(mode);
};

// Returns The Right Data For A Row Depending on Type of Column Selected in ColumnType
export const getColumnData = (
  item: UniversityData,
  columnType: ColumnType,
  mode: ModeType,
  departmentCip?: string
): string => {

  if (!isColumnAllowedForMode(columnType, mode)) {
    return 'N/A';
  }

  let content: UndergradContent | GradContent | undefined;
  if (mode === ModeType.Undergrad) {
    content = item.content?.undergrad_content;
  } else {
    content = item.content?.grad_content;
  }

  //These are columns that can be retrieved for department-specific information
  if (departmentCip && departmentCip != "general") {
    //Find Department Based on Department CIP
    const dept = content?.dept_contents?.find(d => d.cip === departmentCip);

    //If Department not there for this university, say "No Info"
    if (!dept) return 'No Info';

    switch (columnType) {
      case ColumnType.TotalStudents:
        return dept.total_students || 'No Info';
      case ColumnType.GraduationRate:
        return dept.graduation_rate || 'No Info';
      case ColumnType.StudentFacultyRatio:
        return 'No Info';
      default:
        return 'Error'; // Some columns like Location can't be department-specific
    }
  }

  //These are columns that can be retrieved for general information
  switch (columnType) {
    case ColumnType.Location:
      return item.location || 'N/A';
    case ColumnType.TotalStudents:
      return content?.general_content.total_students || 'N/A';
    case ColumnType.GraduationRate:
      return content?.general_content.graduation_rate || 'N/A';
    case ColumnType.StudentFacultyRatio:
      return (content as any)?.general_content?.studentFacultyRatio || 'N/A';
     case ColumnType.SATScore:
      // Type assertion since we already checked mode restriction, stop bothering us please
       return (content as any)?.general_content?.sat_score || 'N/A';
    case ColumnType.ACTScore:
       return (content as any)?.general_content?.act_score || 'N/A';
    case ColumnType.AdmissionsRate:
      return content?.general_content.admissions_rate || 'N/A';
    case ColumnType.HouseholdIncome:
      return content?.general_content.avg_household_income || 'N/A';
    default:
      return 'N/A';
  }
};







// CIP Helpers


// Group Departments by the first two digits of their CIP
export const groupDepartmentsByCIP = (departments: UGradDeptContent[] | GradDeptContent[]) => {
  return departments.reduce((groups, dept) => {
    const cipPrefix = dept.cip.substring(0, 2);
    if (!groups[cipPrefix]) {
      groups[cipPrefix] = [];
    }
    groups[cipPrefix].push(dept);
    return groups;
  }, {} as Record<string, (UGradDeptContent | GradDeptContent)[]>);
};

// Function to get Department type from CIP label
export const CIP_TO_CLASSIFICATION: Record<string, string> = {
  "01": "Agricultural/Animal/Plant/Vet Science",
  "03": "Natural Resources & Conservation",
  "04": "Architecture & Related Services",
  "05": "Area/Ethnic/Cultural/Gender Studies",
  "09": "Communication/Journalism",
  "10": "Communications Tech/Support",
  "11": "Computer & Info Sciences",
  "12": "Culinary/Entertainment/Personal Svcs",
  "13": "Education",
  "14": "Engineering",
  "15": "Engineering Techs/Technicians",
  "16": "Foreign Languages/Linguistics",
  "19": "Family & Consumer Sciences",
  "22": "Legal Professions & Studies",
  "23": "English Language/Literature",
  "24": "Liberal Arts & Humanities",
  "25": "Library Science",
  "26": "Biological & Biomedical Sciences",
  "27": "Mathematics & Statistics",
  "28": "Military Science/Leadership",
  "29": "Military Techs/Applied Sciences",
  "30": "Multidisciplinary Studies",
  "31": "Parks/Recreation/Fitness/Kinesiology",
  "32": "Basic Skills/Remedial Education",
  "33": "Citizenship Activities",
  "34": "Health-Related Knowledge/Skills",
  "35": "Interpersonal & Social Skills",
  "36": "Leisure & Recreational Activities",
  "37": "Personal Awareness/Self-Improvement",
  "38": "Philosophy & Religious Studies",
  "39": "Theology & Religious Vocations",
  "40": "Physical Sciences",
  "41": "Science Techs/Technicians",
  "42": "Psychology",
  "43": "Homeland Security/Law Enforcement",
  "44": "Public Admin & Social Services",
  "45": "Social Sciences",
  "46": "Construction Trades",
  "47": "Mechanic & Repair Techs",
  "48": "Precision Production",
  "49": "Transportation/Materials Moving",
  "50": "Visual & Performing Arts",
  "51": "Health Professions",
  "52": "Business/Management/Marketing",
  "53": "High School Diplomas/Certificates",
  "54": "History",
  "60": "Health Professions Residency",
  "61": "Medical Residency/Fellowships"
};

export const cipToClassificationName = (cipPrefix: string) => {
  return CIP_TO_CLASSIFICATION[cipPrefix] || "Unknown CIP Code";
}


// Retrieving Department Information in General from Universities


export const getAllDepartments = (universities: UniversityData[]) => {
  const departments = new Set<string>();
  universities.forEach(u => {
    u.content?.undergrad_content?.dept_contents?.forEach(d => departments.add(d.cip));
    u.content?.grad_content?.dept_contents?.forEach(d => departments.add(d.cip));
  });
  return Array.from(departments);
};