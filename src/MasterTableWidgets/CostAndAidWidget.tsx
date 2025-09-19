import React, { useState } from 'react';
import { Box, Text, Tabs, TabList, Tab, Flex, Badge } from '@chakra-ui/react';
import PercentileBar from 'src/helpers/PercentileBar';

interface CostAndAidWidgetProps {
    inStateTuition?: string;
    outOfStateTuition?: string;
    inStatePercentile?: number;
    outOfStatePercentile?: number;
}


enum CostAidTab {
    Cost = 'cost',
    OverallAid = 'overall-aid',
    Debt = 'debt'
}

enum CostDetailTab {
    Overall = 'overall',
    ByIncome = 'by-income'
}

const CostAndAidWidget: React.FC<CostAndAidWidgetProps> = ({
    inStateTuition = '$15,000',
    outOfStateTuition = '$35,000',
    inStatePercentile = 96,
    outOfStatePercentile = 30
}) => {
    const [activeTab, setActiveTab] = useState<CostAidTab>(CostAidTab.Cost);

    const [costDetailTab, setCostDetailTab] = useState<CostDetailTab>(CostDetailTab.Overall);

    const renderCostTab = () => (
        <Flex direction="column" gap={3} height="100%" justifyContent="center">
            {costDetailTab === CostDetailTab.Overall ? (
                <>
                    {/* In-State Tuition */}
                    <Box textAlign="center">
                        <Text fontSize="sm" color="gray.600">
                            Avg. Net Cost (In-State)
                        </Text>
                        <Text fontSize={{ base: "2xl", md: "5xl" }} fontWeight="bold" color="black">
                            {inStateTuition}
                        </Text>
                        <PercentileBar value={inStatePercentile} />
                    </Box>

                    {/* Out-of-State Tuition */}
                    <Box textAlign="center">
                        <Text fontSize="sm" color="gray.600">
                            Avg. Net Cost (Out-of-State)
                        </Text>
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.600">
                            {outOfStateTuition}
                        </Text>
                        <PercentileBar value={outOfStatePercentile} />
                    </Box>
                </>
            ) : (
                <Flex height="100%" alignItems="center" justifyContent="center" color="gray.500" fontSize="sm">
                    Cost by income information will be displayed here
                </Flex>
            )}
        </Flex>
    );


    const renderSecondaryTabs = () => (
        <Tabs
            variant="soft-rounded"
            size="sm"
            onChange={(index) => setCostDetailTab(Object.values(CostDetailTab)[index])}
        >
            <TabList justifyContent="center" flexWrap="wrap" gap={{ base: 1, md: 2 }}>
                {Object.values(CostDetailTab).map((tab) => (
                    <Tab
                        key={tab}
                        fontSize={{ base: "xs", sm: "2xs", md: "xs" }}
                        px={{ base: 0.5, sm: 1, md: 2 }}
                        py={{ base: 0.5, sm: 1, md: 2 }}
                        whiteSpace="nowrap"
                        flexShrink={0}
                    >
                        {tab === CostDetailTab.Overall && "Overall"}
                        {tab === CostDetailTab.ByIncome && "By Income"}
                    </Tab>
                ))}
            </TabList>
        </Tabs>
    );

    return (
        <Box
            p={4}
            borderWidth={1}
            borderRadius="md"
            display="flex"
            flexDirection="column"
            gap={4}
            minHeight="120px"
            bg="white"
            border="1px solid rgba(255, 255, 255, 0.2)"
            position="relative"
        >
            <Box>
                {/* Horizontal tabs at the top */}
                <Tabs
                    variant="soft-rounded"
                    onChange={(index) => setActiveTab(Object.values(CostAidTab)[index])}
                >
                    <TabList justifyContent="center" flexWrap="wrap" gap={{ base: 1, md: 2 }} mb={3.5}>
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
                        {activeTab === CostAidTab.Cost && renderCostTab()}
                        {activeTab === CostAidTab.OverallAid && "Overall aid information will be displayed here"}
                        {activeTab === CostAidTab.Debt && "Debt information will be displayed here"}
                    </Flex>
                </Box>

                {activeTab === CostAidTab.Cost && renderSecondaryTabs()}
            </Box>
        </Box>
    );
};

export default CostAndAidWidget;