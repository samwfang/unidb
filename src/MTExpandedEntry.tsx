import React, {useState} from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box, Grid, Text, Select, Input, List, ListItem} from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content, UndergradContent, GradContent } from './MasterTable';
import { ModeType } from './App';
import DepartmentContent from './MTDepartmentContent';
import GraduationRateWidget from './MasterTableWidgets/GraduationRateWidget';
import TotalStudentsWidget from './MasterTableWidgets/TotalStudentsWidget';
import { Tooltip } from '@chakra-ui/react';

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
  //Number of Top Departments to Display by Default
  const TOP_NUM_DEPTS = 5;
  //Maximum Number of Tabs User Can Create
  const MAX_TABS = 20;


  const deptContents = mode === ModeType.Undergrad 
    ? content?.undergrad_content?.dept_contents
    : content?.grad_content?.dept_contents;
  
  //All Departments offered by University (if none, then [])
  const availableDepts = deptContents || [];
  //Initial Departments Shown on Front Page. Up to TOP_NUM_DEPTS can be shown at once. These are simply filled by 
  // the top items in DeptContent[] (in API they should be sorted by #visitors)
  const initialDeptSelections = [...availableDepts.slice(0, TOP_NUM_DEPTS).map(dept => dept.department_name), "",];
  //Array to store the deparments currently selected by the user
  const [selectedDepts, setSelectedDepts] = useState<string[]>(initialDeptSelections);
  //Current Active Tab
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // State for filtering the department list
  const [inputValue, setInputValue] = useState("");

  // Filtered department options based on user input
  const filteredDepts = availableDepts.filter(dept =>
    dept.department_name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  
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


  //Handle Tab CLosing and Opening
  const handleCloseTab = (index: number) => {
    const updatedSelections = [...selectedDepts];
    updatedSelections.splice(index, 1);
    setSelectedDepts(updatedSelections);

    // Adjust active tab index
    if (activeTabIndex > index) {
      // Only decrement if the active tab is after the closed tab
      setActiveTabIndex((prev) => Math.max(0, prev - 1));
    } else if (activeTabIndex === index) {
      // If the currently active tab is closed, make sure to stay on a valid tab
      setActiveTabIndex((prev) => Math.max(0, prev));
    }
  };

  const handleAddTab = () => {
    if (selectedDepts.length < MAX_TABS) {
      setSelectedDepts([...selectedDepts, ""]);
    }
  };

    

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
    <AccordionPanel pb={4} bg="white">
      <Tabs index={activeTabIndex} onChange={setActiveTabIndex}>
          <TabList flexWrap="wrap">
            <Tab _selected={{
            color: mode === 'undergrad' ? "blue.500" : "green.500", // Change text color
            borderBottom: '2px solid', // Ensure there is an underline
            borderColor: mode === 'undergrad' ? "blue.500" : "green.500", // Change underline color
          }}><b>General</b></Tab>
          {/* Render Tabs with names of Selected Departments*/}
          {selectedDepts.map((deptName, index) => (
            <Box display="flex" alignItems="center" key={index}>
              <Tab
                whiteSpace="nowrap"
                _selected={{
                  color: mode === 'undergrad' ? "blue.500" : "green.500",
                  borderBottom: '2px solid',
                  borderColor: mode === 'undergrad' ? "#blue.500" : "green.500",
                }}
              >
                {deptName || <i>New Tab</i>}
              </Tab>
              {/* Close Button Outside of Tab Clickable Area */}
              <Box
                as="span"
                ml={2}
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleCloseTab(index);
                }}
                _hover={{ color: "red.500" }}
                cursor="pointer"
              >
                ×
              </Box>
            </Box>
          ))}
          {/* Allow User to Add New Tab If Not At Maximum */}
          {selectedDepts.length < MAX_TABS ? (
            <Tab onClick={handleAddTab} _hover={{ bg: "gray.100" }}>
              +
            </Tab>
          ) : (
            <Tooltip label="Maximum tabs reached" placement="top" hasArrow>
              <Tab isDisabled _hover={{ cursor: "not-allowed" }}>
                +
              </Tab>
            </Tooltip>
          )}
          </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box p={4}>{renderGeneralContent(generalContent) || "No general content available"}</Box>
          </TabPanel>
          
           {selectedDepts.map((selectedDept, index) => (
            <TabPanel key={index}>
              <Box p={4}>
                {selectedDept === "" ? (
                  // Show Input for autocomplete selection
                  <Box>
                    <Text>Select a department to display information on this tab.</Text>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type to search..."
                    />
                    <List>
                      {filteredDepts.map((dept, i) => (
                        <ListItem
                          key={i}
                          onClick={() => {
                            handleDeptSelection(index, dept.department_name);
                            setInputValue(""); // Clear input after selection
                          }}
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                        >
                          {dept.department_name}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  // Display Department Content if a department is selected
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