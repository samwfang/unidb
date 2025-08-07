import React from 'react';
import { Box, Text, Flex, Circle, Badge } from '@chakra-ui/react';

interface UniversitySummaryWidgetProps {
    universityName: string;
    rank?: string;
    isPublic?: boolean;
    sectorScorecard?: number;
}

const sectorLabels: Record<number, string> = {
    1: 'Graduate-only',
    2: 'Graduate-only Nonprofit',
    3: 'Graduate-only For-Profit',
    4: '4-year',
    5: '4-year Nonprofit',
    6: '4-year For-Profit',
    7: '2-year',
    8: '2-year Nonprofit',
    9: '2-year For-Profit',
    10: '<2-year',
    11: '<2-year Nonprofit',
    12: '<2-year For-Profit',
    13: 'Other',
    14: 'Nonprofit',
    15: 'For-Profit'
};

const UniversitySummaryWidget: React.FC<UniversitySummaryWidgetProps> = ({ universityName, rank, isPublic,
    sectorScorecard }) => {
    return (
        <Box
            p={4}
            borderWidth={1}
            borderRadius="md"
            minHeight="120px"
            bg="rgba(255, 255, 255, 0.2)"
            boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            mb={4} // Add margin bottom to separate from other widgets
        >
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="flex-start" gap={8}>
                    <Circle
                        size="60px"
                        bg={"blue.500"}
                        color="white"
                    >
                        <Text fontSize="2xl" fontWeight="bold">{rank || 'N/A'}</Text>
                    </Circle>
                    <Box>
                        <Text fontSize="3xl" fontWeight="bold">{universityName}</Text>
                        <Flex alignItems="center" gap={4} mt={1}>
                            <Text fontSize="md" color="gray.600">123 University Ave, City, State</Text>
                            <Badge colorScheme="green" borderRadius="full" px={2} py={1}>
                                <Flex alignItems="center" gap={1}>
                                    <Box>✓</Box>
                                    <Text>Middle States Commission</Text>
                                </Flex>
                            </Badge>
                        </Flex>
                    </Box>
                </Flex>
                <Flex direction="column" gap={2} alignItems="flex-end">
                    <Badge
                        borderRadius="full"
                        px={4}
                        py={1}
                        colorScheme={isPublic ? 'blue' : 'purple'}
                    >
                        {isPublic ? 'Public' : 'Private'}
                    </Badge>
                    {sectorScorecard && (
                        <Badge
                            borderRadius="full"
                            px={4}
                            py={1}
                            colorScheme="orange"
                        >
                            {sectorLabels[sectorScorecard] || 'Unknown'}
                        </Badge>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};

export default UniversitySummaryWidget;