import React from 'react';
import { Box, Text, Flex, Circle, Badge, Grid, GridItem, useColorMode } from '@chakra-ui/react';
import SmallAttributeBox from 'src/containers/SmallAttributesBox';

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
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Box
            p={{ base: 3, md: 5 }}
            borderRadius="xl"
            mb={4}
            bg={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
            border="1px solid"
            borderColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
        >
            <Flex alignItems="center" justifyContent="space-between" gap={4} flexDirection={{ base: "column", md: "row" }}>
                <Flex alignItems="flex-start" gap={{ base: 3, md: 6 }}>
                    <Circle
                        size={{ base: "36px", md: "48px" }}
                        bg="brand.500"
                        color="white"
                        flexShrink={0}
                    >
                        <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="700">{rank || 'N/A'}</Text>
                    </Circle>
                    <Box>
                        <Text
                            fontSize={{ base: "md", md: "xl" }}
                            fontWeight="600"
                            color={isDark ? 'gray.100' : 'gray.800'}
                            lineHeight="short"
                        >
                            {universityName}
                        </Text>
                        <Flex
                            gap={3}
                            mt={1}
                            alignItems="center"
                            flexDirection={{ base: "column", md: "row" }}
                        >
                            <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color={isDark ? 'gray.400' : 'gray.500'}
                            >
                                123 University Ave, City, State
                            </Text>
                            <Badge
                                colorScheme="green"
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="xs"
                                fontWeight="500"
                                display={{ base: "none", md: "inline-flex" }}
                            >
                                ✓ Accredited
                            </Badge>
                        </Flex>
                    </Box>
                </Flex>

                <Flex direction="column" gap={2} alignItems={{ base: "flex-start", md: "flex-end" }}>
                    <Badge
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        colorScheme={isPublic ? 'blue' : 'purple'}
                        fontSize="xs"
                        fontWeight="500"
                    >
                        {isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Box
                        as="button"
                        bg="brand.500"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        _hover={{ bg: 'brand.600' }}
                        textAlign="center"
                        fontSize="xs"
                        fontWeight="500"
                        transition="all 0.15s ease"
                    >
                        Website
                    </Box>
                </Flex>
            </Flex>

            <Grid
                templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={2}
                mt={4}
                w="100%"
            >
                {sectorScorecard && (
                    <GridItem>
                        <SmallAttributeBox>
                            <Text fontSize="2xs" color={isDark ? 'gray.500' : 'gray.400'}>Classification</Text>
                            <Text fontSize="xs" fontWeight="600" wordBreak="break-word" mt={0.5}>
                                {sectorLabels[sectorScorecard] || 'Unknown'}
                            </Text>
                        </SmallAttributeBox>
                    </GridItem>
                )}
                <GridItem>
                    <SmallAttributeBox>
                        <Text fontSize="2xs" color={isDark ? 'gray.500' : 'gray.400'}>Region</Text>
                        <Text fontSize="xs" fontWeight="600" mt={0.5}>{region || 'Unknown'}</Text>
                    </SmallAttributeBox>
                </GridItem>
                <GridItem>
                    <SmallAttributeBox>
                        <Text fontSize="2xs" color={isDark ? 'gray.500' : 'gray.400'}>Urban Index</Text>
                        <Text fontSize="xs" fontWeight="600" mt={0.5}>{citySize || 'Unknown'}</Text>
                    </SmallAttributeBox>
                </GridItem>
                <GridItem>
                    <SmallAttributeBox>
                        <Text fontSize="2xs" color={isDark ? 'gray.500' : 'gray.400'}>College Size</Text>
                        <Text fontSize="xs" fontWeight="600" mt={0.5}>{collegeSize || 'Unknown'}</Text>
                    </SmallAttributeBox>
                </GridItem>
            </Grid>

            <Box
                as="button"
                w="100%"
                mt={4}
                py={2}
                borderRadius="lg"
                bg={isDark ? 'rgba(255,255,255,0.05)' : 'gray.50'}
                border="1px solid"
                borderColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                color={isDark ? 'gray.400' : 'gray.500'}
                fontSize="xs"
                fontWeight="500"
                cursor="not-allowed"
                opacity={0.7}
                transition="all 0.15s ease"
            >
                View Details
            </Box>
        </Box>
    );
};

export default UniversitySummaryWidget;