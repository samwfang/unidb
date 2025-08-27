import React, { useState } from 'react';
import { Box, Text, Tabs, TabList, Tab, Flex } from '@chakra-ui/react';

interface CostAndAidWidgetProps {
  // Props will be added as we implement the content
}

enum CostAidTab {
  Cost = 'cost',
  OverallAid = 'overall-aid',
  Debt = 'debt'
}

const CostAndAidWidget: React.FC<CostAndAidWidgetProps> = () => {
  const [activeTab, setActiveTab] = useState<CostAidTab>(CostAidTab.Cost);

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      display="flex"
      flexDirection="column"
      gap={4}
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      position="relative"
    >
      <Box>
        {/* Horizontal tabs at the top */}
        <Tabs
          variant="soft-rounded"
          onChange={(index) => setActiveTab(Object.values(CostAidTab)[index])}
        >
          <TabList justifyContent="center" flexWrap="wrap" gap={{ base: 1, md: 2 }} mb={4}>
            {Object.values(CostAidTab).map((tab) => (
              <Tab
                key={tab}
                fontSize={{ base: "sm", sm: "xs", md: "sm" }}
                px={{ base: 1, sm: 1, md: 2 }}
                py={{ base: 1, sm: 1, md: 2 }}
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {tab === CostAidTab.Cost && "Cost"}
                {tab === CostAidTab.OverallAid && "Overall Aid"}
                {tab === CostAidTab.Debt && "Debt"}
              </Tab>
            ))}
          </TabList>
        </Tabs>

        {/* Content area with same dimensions as TotalStudentsWidget */}
        <Box height="250px" position="relative" overflow="visible">
          {/* Content will be added based on active tab */}
          <Flex 
            height="100%" 
            alignItems="center" 
            justifyContent="center" 
            color="gray.500"
            fontSize="sm"
          >
            {activeTab === CostAidTab.Cost && "Cost information will be displayed here"}
            {activeTab === CostAidTab.OverallAid && "Overall aid information will be displayed here"}
            {activeTab === CostAidTab.Debt && "Debt information will be displayed here"}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default CostAndAidWidget;