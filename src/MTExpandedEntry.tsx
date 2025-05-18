import React, {useState} from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box, Grid, Text} from '@chakra-ui/react';
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

  const [selectedOtherDept, setSelectedOtherDept] = useState<number | null>(null);


  if (isLoading) return <AccordionPanel pb={4}>Loading...</AccordionPanel>;

  const deptContents = mode === ModeType.Undergrad 
    ? content?.undergrad_content?.dept_contents
    : content?.grad_content?.dept_contents;
  
  const generalContent = mode === ModeType.Undergrad 
    ? content?.undergrad_content
    : content?.grad_content;

  const TOP_NUM_DEPTS = 5;
  // Split departments into first 5 and others
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
            {topDepts.map((dept, index) => (
              <Tab key={index} whiteSpace="nowrap">{dept.department_name}</Tab>
            ))}
            {otherDepts.length > 0 && <Tab whiteSpace="nowrap">Other</Tab>}
          </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box p={4}>{renderGeneralContent(generalContent) || "No general content available"}</Box>
          </TabPanel>
          
          {/* Only render panels for top departments */}
          {topDepts.map((dept, index) => (
            <TabPanel key={index}>
              <DepartmentContent content={dept.content} />
            </TabPanel>
          ))}
          
          {/* Other departments panel */}
          {otherDepts.length > 0 && (
            <TabPanel>
              <Box p={4}>
                <select 
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedOtherDept(value === "" ? null : parseInt(value));
                  }}
                  className="department-select"
                  value={selectedOtherDept === null ? "" : selectedOtherDept.toString()}
                >
                  <option value="">Select a department</option>
                  {otherDepts.map((dept, index) => (
                    <option key={index} value={index}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
                {selectedOtherDept !== null && (
                  <DepartmentContent content={otherDepts[selectedOtherDept].content} />
                )}
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </AccordionPanel>
  );
};

export default MTExpandedEntry;