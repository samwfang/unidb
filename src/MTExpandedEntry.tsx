import React from 'react';
import { AccordionPanel, TabList, TabPanels, TabPanel, Tab, Tabs, Box } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content } from './MasterTable';
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
    ? content?.undergrad_content?.general_content
    : content?.grad_content?.general_content;

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
            <Box p={4}>{generalContent || "No general content available"}</Box>
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