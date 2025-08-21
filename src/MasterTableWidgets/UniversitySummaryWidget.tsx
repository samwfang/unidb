import React from 'react';
import { Box, Text, Flex, Circle, Badge } from '@chakra-ui/react';
import { FaCity, FaMapMarkedAlt, FaUniversity } from 'react-icons/fa';

interface UniversitySummaryWidgetProps {
    universityName: string;
    rank?: string;
    isPublic?: boolean;
    sectorScorecard?: number;
    region?: string;
    citySize?: string;
    collegeSize?: string;
}

const sectorLabels: Record<number, string> = {
    1: 'Graduate-Only Public',
    2: 'Graduate-Only Nonprofit',
    3: 'Graduate-Only For-Profit',
    4: '4 Year Public',
    5: '4 Year Nonprofit',
    6: '4 Year For-Profit',
    7: '2 Year Public',
    8: '2 Year Nonprofit',
    9: '2 Year For-Profit',
    10: '<2 Year Public',
    11: '<2 Year Nonprofit',
    12: '<2 Year For-Profit',
    13: 'Public',
    14: 'Nonprofit',
    15: 'For-Profit'
};

const sectorLabelColors = (sectorLabel: number): string => {
    switch (sectorLabel) {
        case 1:
        case 4:
        case 7:
        case 10:
        case 13:
            return "green.200";
        case 2:
        case 5:
        case 8:
        case 11:
        case 14:
            return "purple.200";
        default: return "orange.200";
    }
};

const sizeBadgeColors: Record<string, string> = {
    'Large': 'red',
    'Medium': 'yellow',
    'Small': 'green'
};

const UniversitySummaryWidget: React.FC<UniversitySummaryWidgetProps> = ({ universityName, rank, isPublic,
    sectorScorecard, region = "Midwest", citySize = "Medium", collegeSize = "Large" }) => {
    return (
        <Box
            p={{ base: 3, md: 4 }}
            borderRadius="md"
            minHeight="120px"
            mb={4}
        >
            <Flex alignItems="center" justifyContent="space-between" gap={{ base: 4, md: 0 }}>
                <Flex alignItems="flex-start" gap={{ base: 4, md: 8 }}>
                    <Circle
                        size={{ base: "50px", md: "60px" }}
                        bg={"blue.500"}
                        color="white"
                    >
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">{rank || 'N/A'}</Text>
                    </Circle>
                    <Box>
                        <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="bold">{universityName}</Text>
                        <Flex gap={{ base: 2, md: 4 }} mt={1}  alignItems={{ base: "flex-start", md: "center" }}>
                            <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">123 University Ave, City, State</Text>
                            <Badge colorScheme="green" borderRadius="full" px={2} py={1} fontSize={{ base: "xs", md: "sm" }}>
                                <Flex alignItems="center" gap={1}>
                                    <Box>✓</Box>
                                    <Text>Middle States Commission</Text>
                                </Flex>
                            </Badge>
                        </Flex>
                    </Box>
                </Flex>

                <Flex direction="column" gap={2} alignItems={{ base: "flex-start", md: "flex-end" }} mt={{ base: 2, md: 0 }}>
                    <Badge
                        borderRadius="full"
                        px={4}
                        py={1}
                        colorScheme={isPublic ? 'blue' : 'purple'}
                        fontSize={{ base: "xs", md: "sm" }}
                    >
                        {isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Box
                        as="button"
                        bg="blue.500"
                        color="white"
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        _hover={{ bg: "blue.600" }}
                        maxW="200px"
                        textAlign="center"
                        fontSize={{ base: "xs", md: "sm" }}
                        onClick={() => window.open('https://www.university.edu', '_blank')}
                    >
                        Website
                    </Box>
                </Flex>
            </Flex>

            <Flex gap={4} mt={6} width="100%" flexWrap="wrap" direction={{ base: "column", md: "row" }}>
                {sectorScorecard && (
                    <Box
                        flex={{ base: "none", md: "1" }}
                        bg={"gray.100"}
                        borderRadius="lg"
                        p={1.5}
                        minW="120px"
                        textAlign="center"
                        width={{ base: "100%", md: "auto" }}
                    >
                        <Text fontSize={{ base: "xs", md: "sm" }}>Classification:</Text>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">{sectorLabels[sectorScorecard] || 'Unknown'}</Text>
                    </Box>
                )}
                {/* Region Box */}
                <Box
                    flex={{ base: "none", md: "1" }}
                    bg="gray.100"
                    borderRadius="lg"
                    p={1.5}
                    minW="120px"
                    textAlign="center"
                    width={{ base: "100%", md: "auto" }}
                >
                    <Text fontSize={{ base: "xs", md: "sm" }}>Region:</Text>
                    <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">{region || 'Unknown'}</Text>
                </Box>

                {/* City Size Box */}
                <Box
                    flex={{ base: "none", md: "1" }}
                    bg='gray.100'
                    borderRadius="lg"
                    p={1.5}
                    minW="120px"
                    textAlign="center"
                    width={{ base: "100%", md: "auto" }}
                >
                    <Text fontSize={{ base: "xs", md: "sm" }}>Urban Index:</Text>
                    <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">{citySize || 'Unknown'} City</Text>
                </Box>

                {/* College Size Box */}
                <Box
                    flex={{ base: "none", md: "1" }}
                    bg={'gray.100'}
                    borderRadius="lg"
                    p={1.5}
                    minW="120px"
                    textAlign="center"
                    width={{ base: "100%", md: "auto" }}
                >
                    <Text fontSize={{ base: "xs", md: "sm" }}>College Size:</Text>
                    <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">{collegeSize || 'Unknown'} College</Text>
                </Box>
            </Flex>
            
            <Flex gap={8} mt={4} width="100%" justifyContent="center">
                <Box
                    as="button"
                    bg="blue.500"
                    color="white"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    _hover={{ bg: "blue.600" }}
                    flex="1"
                    minH="40px"
                    textAlign="center"
                    fontSize={{ base: "xs", md: "sm" }}
                    opacity={0.7}
                    cursor="not-allowed"
                    title="Coming soon"
                >
                    View Details
                </Box>
            </Flex>
        </Box>
    );
};

export default UniversitySummaryWidget;