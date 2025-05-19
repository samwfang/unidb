import React, {useState} from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box, Grid, Text, Select} from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content, UndergradContent, GradContent } from './MasterTable';
import { ModeType } from './App';
import DepartmentContent from './MTDepartmentContent';
import GraduationRateWidget from './MasterTableWidgets/GraduationRateWidget';
import TotalStudentsWidget from './MasterTableWidgets/TotalStudentsWidget';

/*
Expanded Entries: Rendering The Graphics Which Show when User Clicks An Entry in the Master Table

Renders Tabs for Top 5 Departments in University, then "Other" to Show the Other Departments which can be selected
from dropdown.

Renders the General Information Panel for Undergrad and Grad Students

*/
interface MTExpandedEntryProps {
  mode: ModeType;
  content?: Content;
  isLoading?: boolean;
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ content, mode, isLoading }) => {
  const TOP_NUM_DEPTS = 5;


  const deptContents = mode === ModeType.Undergrad 
    ? content?.undergrad_content?.dept_contents
    : content?.grad_content?.dept_contents;
  
  //All Departments offered by University (if none, then [])
  const availableDepts = deptContents || [];
  //Initial Departments Shown on Front Page. Up to TOP_NUM_DEPTS can be shown at once
  const initialDeptSelections = availableDepts.slice(0, TOP_NUM_DEPTS).map(dept => dept.department_name);
  //Array to store the deparments currently selected by the user
  const [selectedDepts, setSelectedDepts] = useState<string[]>(initialDeptSelections);
  
  const generalContent = mode === ModeType.Undergrad 
    ? content?.undergrad_content
    : content?.grad_content;
  
  // When user changes department tab content, update the selected department array
  const handleDeptSelection = (index: number, departmentName: string) => {
    const updatedSelections = [...selectedDepts];
    updatedSelections[index] = departmentName;
    setSelectedDepts(updatedSelections);
  };

  // Initial setup to fill dropdown selects with the first few departments (Default Tabs)
  React.useEffect(() => {
    setSelectedDepts(initialDeptSelections);
  }, [deptContents]);
  
  if (isLoading) return <AccordionPanel pb={4}>Loading...</AccordionPanel>;
  // TODELETE: Split departments into first 5 and others
  const topDepts = deptContents?.slice(0, TOP_NUM_DEPTS) || [];
  const otherDepts = deptContents?.slice(TOP_NUM_DEPTS) || [];
    

  //Rendering For Undergrad "General" Tab
    const renderGeneralContent = (general: UndergradContent | GradContent | undefined) => (
      mode === ModeType.Undergrad ? (
      /* Render for Undergraduate Content */
      <Box p={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>

            <TotalStudentsWidget totalStudents={general?.general_content.total_students || 'No Data'} />

            <GraduationRateWidget graduationRate={general?.general_content.graduation_rate || 'No Data'} />

        </Grid>
      </Box>
      ):(
        // Render for Graduate Content
        <Box p={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>

            <Box>
              <Text fontWeight="bold">Total Students:</Text>
              <Text> {general?.general_content.total_students} </Text>
            </Box>

            <Box>
              <Text fontWeight="bold">Graduation Rate:</Text>
              <Text> {general?.general_content.graduation_rate} </Text>
            </Box>

        </Grid>
      </Box>
      )
    );

   return (
    <AccordionPanel pb={4}>
      <Tabs variant="enclosed">
          <TabList flexWrap="wrap">
            <Tab>General</Tab>
            {/* Render Tabs with names of Selected Departments*/}
            {selectedDepts.map((deptName, index) => (
            <Tab key={index} whiteSpace="nowrap">
              {deptName || "Set Department"}
            </Tab>
          ))}
          </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box p={4}>{renderGeneralContent(generalContent) || "No general content available"}</Box>
          </TabPanel>
          
           {selectedDepts.map((selectedDept, index) => (
            <TabPanel key={index}>
              <Box p={4}>
                <Select
                  value={selectedDept || ""}
                  onChange={(e) => handleDeptSelection(index, e.target.value)}
                >
                  <option value="">Select a department</option>
                  {deptContents?.map((dept, deptIndex) => (
                    <option key={deptIndex} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </Select>

                {selectedDept !== null && (
                  <DepartmentContent
                    content={
                      deptContents?.find(dept => dept.department_name === selectedDept)?.content || "No content available"
                    }
                  />
                )}
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </AccordionPanel>
  );
};

export default MTExpandedEntry;