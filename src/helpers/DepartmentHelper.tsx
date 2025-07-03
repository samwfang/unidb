import { GradContent, GradDeptContent, UGradDeptContent, UndergradContent, UniversityData } from "../MasterTable";


// Column Types
// To Add a new Column Type: Add to Enum, Add

export enum ColumnType {
  Location = "location",
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

interface ColumnMetadata {
  displayName: string;
  departmentSpecificAllowed: boolean;
}

export const ColumnMetadataMap: Record<ColumnType, ColumnMetadata> = {
  [ColumnType.Location]: {
    displayName: "Location",
    departmentSpecificAllowed: false
  },
  [ColumnType.TotalStudents]: {
    displayName: "Total Students",
    departmentSpecificAllowed: true
  },
  [ColumnType.GraduationRate]: {
    displayName: "Graduation Rate",
    departmentSpecificAllowed: true
  },
  [ColumnType.AverageClassSize]: {
    displayName: "Average Class Size",
    departmentSpecificAllowed: true
  },
  // ... other columns
};


// Return String for Column Display Name
export const getColumnDisplayName = (columnType: ColumnType): string => {
  return ColumnMetadataMap[columnType]?.displayName || "Unknown";
};

export const canBeDepartmentColumn = (columnType: ColumnType): boolean => {
  return ColumnMetadataMap[columnType]?.departmentSpecificAllowed || false;
};

// Returns The Right Data For A Row Depending on Type of Column Selected in ColumnType
export const getColumnData = (
  item: UniversityData,
  columnType: ColumnType,
  mode: 'undergrad' | 'grad',
  departmentCip?: string
): string => {
  let content: UndergradContent | GradContent | undefined;
  if (mode === 'undergrad') {
    content = item.content?.undergrad_content;
  } else {
    content = item.content?.grad_content;
  }

  if (departmentCip) {
    //Find Department Based on Department CIP
    const dept = content?.dept_contents?.find(d => d.cip === departmentCip);

    //If Department not there for this university, say "No Info"
    if (!dept) return 'No Info';

    switch (columnType) {
      case ColumnType.TotalStudents:
        return dept.total_students || 'No Info';
      case ColumnType.GraduationRate:
        return dept.graduation_rate || 'No Info';
      case ColumnType.AverageClassSize:
        return dept.average_class_size || 'No Info';
      default:
        return 'Error'; // Some columns like Location can't be department-specific
    }
  }

  switch (columnType) {
    case ColumnType.Location:
      return item.location || 'N/A';
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


// Retrieving Department Information in General from Universities


export const getAllDepartments = (universities: UniversityData[]) => {
  const departments = new Set<string>();
  universities.forEach(u => {
    u.content?.undergrad_content?.dept_contents?.forEach(d => departments.add(d.cip));
    u.content?.grad_content?.dept_contents?.forEach(d => departments.add(d.cip));
  });
  return Array.from(departments);
};