import { GradContent, GradDeptContent, UGradDeptContent, UndergradContent, UniversityData } from "../MasterTable";


// Column Types
// To Add a new Column Type: Add to Enum, Add

export enum ColumnType {
  TotalStudents = "total_students",
  GraduationRate = "graduation_rate",
  AverageClassSize = "average_class_size",
}

export enum ExtraSortType {
  Alphabetical = "a-z",
  ReverseAlphabetical = "z-a",
}

// types for sorting include all columns alongside other extra options
export type SortType = ColumnType | ExtraSortType;

export const ColumnDisplayNames: Record<ColumnType, string> = {
  [ColumnType.TotalStudents]: "Total Students",
  [ColumnType.GraduationRate]: "Graduation Rate",
  [ColumnType.AverageClassSize]: "Average Class Size",
  // Add more display names as needed
};

// Return String for Column Display Name
export const getColumnDisplayName = (columnType: ColumnType): string => {
  return ColumnDisplayNames[columnType] || "Unknown";
};

// Returns The Right Data For A Row Depending on Type of Column Selected in ColumnType
export const getColumnData = (
  item: UniversityData,
  columnType: ColumnType,
  mode: 'undergrad' | 'grad'
): string => {
  let content: UndergradContent | GradContent | undefined;
  if (mode === 'undergrad') {
    content = item.content?.undergrad_content;
  } else {
    content = item.content?.grad_content;
  }

  switch (columnType) {
    case ColumnType.TotalStudents:
      return content?.general_content.total_students || 'N/A';
    case ColumnType.GraduationRate:
      return content?.general_content.graduation_rate || 'N/A';
    case ColumnType.AverageClassSize:
      return content?.general_content.average_class_size || 'N/A';
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
const CIP_TO_CLASSIFICATION: Record<string, string> = {
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