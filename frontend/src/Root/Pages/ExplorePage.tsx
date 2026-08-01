import React, { useState, useRef } from 'react';
import MasterTable from '../FrontPage/MasterTable';
import { MTControlPanel } from '../FrontPage/MTControlPanel';
import FrontPageInfo from '../FrontPage/FrontPageInfo';
import ThankYouPage from '../FrontPage/ThankYouPage';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ModeType } from '../../helpers/types';

interface ExplorePageProps {
    mode: ModeType;
    onModeChange: () => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ mode, onModeChange }) => {
    const [pageSize, setPageSize] = useState<number>(10);
    const frontPageInfoRef = useRef<HTMLDivElement>(null);
    const masterTableRef = useRef<HTMLDivElement>(null);

    const scrollToMasterTable = () => {
        masterTableRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Flex
                maxW="1100px"
                w="100%"
                px={{ base: 4, md: 8 }}
                mx="auto"
                ref={frontPageInfoRef}
            >
                <FrontPageInfo
                    mode={mode}
                    onModeChange={onModeChange}
                    onFindCollegesClick={scrollToMasterTable}
                />
            </Flex>

            <Box ref={masterTableRef}>
                <Flex
                    direction={{ base: "column", lg: "row" }}
                    gap={6}
                    mt={8}
                    maxW="1300px"
                    mx="auto"
                    w="100%"
                    px={{ base: 4, md: 8 }}
                    alignItems="flex-start"
                >
                    <MTControlPanel
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        mode={mode}
                        onModeChange={onModeChange}
                    />

                    <Box flex={1} w="100%" minW={0}>
                        <MasterTable mode={mode} toggleMode={onModeChange} pageSize={pageSize} />
                    </Box>
                </Flex>

                <Flex maxW="1100px" alignItems="center" mx="auto" px={{ base: 4, md: 8 }}>
                    <ThankYouPage mode={mode} onModeChange={onModeChange} />
                </Flex>
            </Box>

            <Box mt={12} py={6} textAlign="center">
                <Text fontSize="xs" color="gray.400" fontWeight="400">
                    By Samuel Fang · Built with React & Chakra UI
                </Text>
            </Box>
        </>
    );
};

export default ExplorePage;
