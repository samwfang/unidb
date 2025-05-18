import React from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box, Grid, Text} from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content, UndergradContent, GradContent } from './MasterTable';
import { ModeType } from './App';

interface MTExpandedEntryProps {
  mode: ModeType;
  content?: Content;
  isLoading?: boolean;
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ content, mode, isLoading }) => {
  if (isLoading) return <AccordionPanel pb={4}>Loading...</AccordionPanel>;

  const deptContents = mode === ModeType.Undergrad 
    ? content?.undergrad_content?.dept_contents
    : content?.grad_content?.dept_contents;
  
  const generalContent = mode === ModeType.Undergrad 
    ? content?.undergrad_content
    : content?.grad_content;

  //Rendering For Undergrad "General" Tab
    const renderGeneralContent = (general: UndergradContent | GradContent | undefined) => (
      mode === ModeType.Undergrad ? (
      /* Render for Undergraduate Content */
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
      {/* Create Tabs for Each Department */}
      <Tabs variant="enclosed">
        <TabList>
          <Tab>General</Tab>
          {deptContents?.map((dept, index) => (
            <Tab key={index}>{dept.department_name}</Tab>
          ))}
        </TabList>
        
        {/* Content for Each Department */}
        <TabPanels>
          <TabPanel>
            <Box p={4}>{renderGeneralContent(generalContent) || "No general content available"}</Box>
          </TabPanel>
          {deptContents?.map((dept, index) => (
            <TabPanel key={index}>
              <Box p={4}>{dept.content}</Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </AccordionPanel>
  );
};

export default MTExpandedEntry;