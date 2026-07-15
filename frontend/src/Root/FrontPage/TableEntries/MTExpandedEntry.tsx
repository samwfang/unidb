import React, { useState } from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box, Grid, Text, Select, Input, List, ListItem, useColorMode } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content, UndergradContent, UGradDeptContent, GradDeptContent, GradContent, UniversityData } from '../MasterTable';
import { ModeType } from "../../../helpers/types";
import DepartmentContent from './MTDepartmentContent';
import GraduationRateWidget from '../../../UnivWidgets/GraduationRateWidget';
import TotalStudentsWidget from '../../../UnivWidgets/TotalStudentsWidget';
import { Tooltip } from '@chakra-ui/react';
import { cipToClassificationName, groupDepartmentsByCIP } from '../../../helpers/DepartmentHelper';
import UniversitySummaryWidget from '../../../UnivWidgets/UniversitySummaryWidget';
import AdmissionsRateWidget from '../../../UnivWidgets/AdmissionsRateWidget';
import TestScoresWidget from '../../../UnivWidgets/TestScoresWidget';
import CostAndAidWidget from '../../../UnivWidgets/CostAndAidWidget';

/*
Expanded Entries: Rendering The Graphics Which Show when User Clicks An Entry in the Master Table

Renders Tabs for Top 5 Departments in University, then "Other" to Show the Other Departments which can be selected
from dropdown.

Renders the General Information Panel for Undergrad and Grad Students

*/
interface MTExpandedEntryProps {
  mode: ModeType;
  item?: UniversityData;
  rank: number;
  content?: Content;
  isLoading?: boolean;
  isExpanded: boolean;
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ item, content, rank, mode, isLoading, isExpanded }) => {
  //Number of Top Departments to Display by Default
  const TOP_NUM_DEPTS = 5;
  //Maximum Number of Tabs User Can Create
  const MAX_TABS = 20;

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';


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

  // What user types in search bar
  const [inputValue, setInputValue] = useState("");

  //Filter Departments based on user input into search bar
  const filteredDepts = availableDepts.filter(dept =>
    dept.department_name.toLowerCase().includes(inputValue.toLowerCase())
  );


  // Helper function to group departments by the first two digits of their CIP

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



  // Separate rendering functions for undergrad and grad
  const renderUndergradContent = (general: UndergradContent | undefined) => (
    <Box p={2} width="100%" overflow="visible">
      <UniversitySummaryWidget
        universityName={item?.name || 'Unknown University'}
        rank={rank.toString()}
        isPublic={item?.isPublic}
        sectorScorecard={item?.sectorScorecard}
      />
      <Grid
        templateAreas={{
          base: `"rate admissions"
                 "testscores testscores2"
                 "students students"
                  "costaid costaid"`,
          md: `"rate admissions testscores testscores2"
               "students students costaid costaid"
               "students students costaid costaid"`
        }}
        gridTemplateColumns={{
          base: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr"
        }}
        gridTemplateRows={{
          base: "auto auto auto auto",
          md: "auto auto auto"
        }}
        gap={{ base: 2, md: 4 }}
        width="100%"
        alignItems="stretch"
      >
        <Box gridArea="students" height="100%">
          <TotalStudentsWidget
            universityName={item?.name || 'Unknown University'}
            totalStudentsPercentile={general?.general_content.total_student_percentile || 'No Data'}
            totalStudents={general?.general_content.total_students || 'No Data'}
            demographics={general?.demographics}
            departments={general?.dept_contents} />
        </Box>
        <Box gridArea="costaid" height="100%">
          <CostAndAidWidget />
        </Box>
        <Box gridArea="rate" height="100%">
          <GraduationRateWidget
            universityName={item?.name || 'Unknown University'}
            graduationRate={general?.general_content.graduation_rate || 'No Data'}
            graduationRatePercentile={general?.general_content.graduation_rate_percentile || 'No Data'} />
        </Box>
        <Box gridArea="admissions" height="100%">
          <AdmissionsRateWidget
            universityName={item?.name || 'Unknown University'}
            admissionsRate={general?.general_content.admissions_rate || 'No Data'}
            admissionsRatePercentile={general?.general_content.admissions_rate_percentile || 'No Data'} />
        </Box>
        <Box gridArea="testscores" height="100%">
          <TestScoresWidget
            universityName={item?.name || 'Unknown University'}
            satScore={general?.general_content.sat_score || 'No Data'}
            actScore={general?.general_content.act_score || 'No Data'}
            satScorePercentile={general?.general_content.sat_score_percentile || 'No Data'}
            actScorePercentile={general?.general_content.act_score_percentile || 'No Data'} />
        </Box>
        <Box gridArea="testscores2" height="100%">
          <TestScoresWidget
            universityName={item?.name || 'Unknown University'}
            satScore={"1440"} actScore={"34"}
            satScorePercentile={"96"} actScorePercentile={"85"} />
        </Box>
      </Grid>
    </Box>
  );

  const renderGradContent = (general: GradContent | undefined) => (
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
  );

  // Unified render function
  const renderGeneralContent = () => {
    if (mode === ModeType.Undergrad) {
      return renderUndergradContent(content?.undergrad_content);
    } else {
      return renderGradContent(content?.grad_content);
    }
  };

  //Render Departments by Group in New Tab
  const renderFilteredGroupedDepartments = () => {
    const groupedDepartments = groupDepartmentsByCIP(filteredDepts);

    const groupedEntries = Object.entries(groupedDepartments);

    // Calculate halfway point for splitting into two columns
    const midpoint = Math.ceil(groupedEntries.length / 2);

    // Split groups into two roughly equal parts
    const firstColumnGroups = groupedEntries.slice(0, midpoint);
    const secondColumnGroups = groupedEntries.slice(midpoint);

    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {[firstColumnGroups, secondColumnGroups].map((columnGroups, columnIndex) => (
          <Box key={columnIndex}>
            {columnGroups.map(([cip, depts]) => (
              <Box key={cip} mb={4}>
                <Text
                  fontWeight="600"
                  mt={3}
                  mb={2}
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? 'gray.300' : 'gray.600'}
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {cipToClassificationName(cip)}
                </Text>
                <List>
                  {depts.map((dept, i) => (
                    <ListItem
                      key={i}
                      onClick={() => {
                        handleDeptSelection(activeTabIndex - 1, dept.department_name);
                      }}
                      cursor="pointer"
                      _hover={{
                        bg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      }}
                      p={1.5}
                      borderRadius="md"
                      fontSize={{ base: "xs", md: "sm" }}
                      transition="background 0.1s ease"
                    >
                      {dept.department_name}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        ))}
      </Grid>
    );
  };

  const activeColor = mode === ModeType.Undergrad ? 'brand.500' : 'purple.500';

  return (
    <AccordionPanel pb={4} px={{ base: 2, md: 3 }} borderTop="none">
      {isExpanded && (
        <Tabs variant="default" index={activeTabIndex} isLazy onChange={setActiveTabIndex} overflowX="auto">
          <TabList
            flexWrap="wrap"
            minW="300px"
            overflowX="auto"
            borderBottom="1px solid"
            borderColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
            gap={0.5}
            mb={3}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            }}
          >
            <Tab
              _selected={{
                color: activeColor,
                borderBottom: '2px solid',
                borderColor: activeColor,
              }}
              _hover={{ color: isDark ? 'gray.200' : 'gray.700' }}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="500"
              px={{ base: 3, md: 4 }}
              py={{ base: 2, md: 2.5 }}
              whiteSpace="nowrap"
              minW="auto"
              transition="all 0.15s ease"
            >
              General
            </Tab>
            {selectedDepts.map((deptName, index) => (
              <Box display="flex" alignItems="center" key={index}>
                <Tab
                  whiteSpace="nowrap"
                  _selected={{
                    color: activeColor,
                    borderBottom: '2px solid',
                    borderColor: activeColor,
                  }}
                  _hover={{ color: isDark ? 'gray.200' : 'gray.700' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="500"
                  px={{ base: 3, md: 4 }}
                  py={{ base: 2, md: 2.5 }}
                  minW="auto"
                  maxW={{ base: "120px", md: "none" }}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  transition="all 0.15s ease"
                >
                  {deptName || <Text as="span" fontStyle="italic" opacity={0.5}>New Tab</Text>}
                </Tab>
                <Box
                  as="span"
                  ml={0.5}
                  mr={1}
                  fontSize="sm"
                  color={isDark ? 'gray.600' : 'gray.400'}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleCloseTab(index);
                  }}
                  _hover={{ color: 'red.400' }}
                  cursor="pointer"
                  flexShrink={0}
                  transition="color 0.15s ease"
                >
                  ×
                </Box>
              </Box>
            ))}
            {selectedDepts.length < MAX_TABS ? (
              <Tab
                onClick={handleAddTab}
                _hover={{ bg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                fontSize={{ base: "xs", md: "sm" }}
                px={{ base: 2, md: 3 }}
                py={{ base: 2, md: 2.5 }}
                minW="auto"
                flexShrink={0}
                color={isDark ? 'gray.500' : 'gray.400'}
                transition="all 0.15s ease"
              >
                +
              </Tab>
            ) : (
              <Tooltip label="Maximum tabs reached" placement="top" hasArrow>
                <Tab isDisabled fontSize={{ base: "xs", md: "sm" }}
                  px={{ base: 2, md: 3 }}
                  py={{ base: 2, md: 2.5 }}
                  minW="auto"
                  flexShrink={0}
                  color="gray.300"
                >
                  +
                </Tab>
              </Tooltip>
            )}
          </TabList>

          <TabPanels>
            <TabPanel p={{ base: 2, md: 3 }}>
              <Box>{renderGeneralContent() || "No general content available"}</Box>
            </TabPanel>

            {selectedDepts.map((selectedDept, index) => (
              <TabPanel key={index} p={{ base: 2, md: 3 }}>
                <Box>
                  {selectedDept === "" ? (
                    <Box>
                      <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} mb={3}>
                        Select a department to display information on this tab.
                      </Text>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type to search departments..."
                        size="sm"
                        mb={4}
                        borderRadius="lg"
                      />
                      {renderFilteredGroupedDepartments()}
                    </Box>
                  ) : (
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
      )}
    </AccordionPanel>
  );
};

export default MTExpandedEntry;