import { Badge, Box, Button, Flex, Grid, Text, Avatar, useColorMode } from "@chakra-ui/react";
import { ModeType } from "../../helpers/types";
import { StarIcon, ViewIcon, SearchIcon, SmallAddIcon } from '@chakra-ui/icons';
import React from "react";
import GlassBox from "src/containers/GlassBox";

interface FrontPageInfoProps {
    mode: ModeType;
    onModeChange: () => void;
    onFindCollegesClick: () => void;
}

const FrontPageInfo: React.FC<FrontPageInfoProps> = ({ mode, onModeChange, onFindCollegesClick }) => {
    const isUndergrad = mode === ModeType.Undergrad;
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    const featureItems = isUndergrad ? [
        { icon: StarIcon, title: "Find The Right College", desc: "Score programs side-by-side using custom criteria" },
        { icon: ViewIcon, title: "Student Population", desc: "View student makeup and post-graduation metrics" },
        { icon: ViewIcon, title: "Admissions Info", desc: "Check acceptance criteria and rates" },
        { icon: ViewIcon, title: "Financial Info", desc: "Compare tuition costs and financial aid" },
    ] : [
        { icon: SearchIcon, title: "Find The Right Lab", desc: "Find research groups currently looking for students" },
        { icon: SmallAddIcon, title: "Faculty Directory", desc: "Search faculty research interests and previous work" },
        { icon: SmallAddIcon, title: "Admissions Criteria", desc: "Check acceptance criteria and rates" },
        { icon: SmallAddIcon, title: "Student Population", desc: "View student makeup and post-graduation metrics" },
    ];

    const accentColor = isUndergrad ? 'brand.500' : 'purple.500';

    return (
        <Box w="100%" mx="auto" mt={{ base: 12, md: 16 }} mb={8}>
            <Flex direction="column" alignItems="center" gap={6}>
                {/* Hero Text */}
                <Flex direction="column" alignItems="center" gap={3}>
                    <Text
                        fontSize={{ base: "2xl", md: "3xl" }}
                        fontWeight="bold"
                        bgGradient="linear(to-r, brand.400, brand.600)"
                        bgClip="text"
                        letterSpacing="tight"
                    >
                        unidb
                    </Text>
                    <Text
                        fontSize={{ base: "2xl", md: "4xl" }}
                        fontWeight="600"
                        color={isDark ? 'gray.100' : 'gray.800'}
                        letterSpacing="tight"
                        lineHeight="short"
                    >
                        The University Database
                    </Text>
                    <Badge
                        fontSize="xs"
                        colorScheme="blue"
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="500"
                    >
                        Demo
                    </Badge>
                </Flex>

                {/* Subtitle */}
                <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color={isDark ? 'gray.400' : 'gray.500'}
                    textAlign="center"
                    maxW="500px"
                    lineHeight="tall"
                >
                    A one-stop shop to find information about U.S. colleges and professors.
                </Text>

                {/* CTA Buttons */}
                <Flex alignItems="center" gap={3}>
                    <Button
                        variant="primary"
                        size={{ base: "sm", md: "md" }}
                        onClick={onFindCollegesClick}
                        px={6}
                    >
                        Find Colleges
                    </Button>
                    <Button
                        variant="secondary"
                        size={{ base: "sm", md: "md" }}
                        px={6}
                    >
                        Find Faculty
                    </Button>
                </Flex>

                {/* Mode Info Card */}
                <GlassBox w={{ base: "100%", md: "720px" }} mt={4} p={{ base: 4, md: 6 }}>
                    <Flex direction="column" alignItems="center" gap={4}>
                        <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            fontWeight="600"
                            color={isDark ? 'gray.100' : 'gray.800'}
                        >
                            {isUndergrad ? "Undergraduate Mode" : "Graduate Mode"}
                        </Text>

                        <Grid
                            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                            gap={3}
                            w="100%"
                        >
                            {featureItems.map((item, i) => (
                                <Flex
                                    key={i}
                                    alignItems="flex-start"
                                    gap={3}
                                    p={3}
                                    borderRadius="lg"
                                    bg={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                                    border="1px solid"
                                    borderColor={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                                >
                                    <Avatar
                                        size="sm"
                                        bg={accentColor}
                                        color="white"
                                        icon={<item.icon />}
                                        flexShrink={0}
                                    />
                                    <Box>
                                        <Text fontWeight="600" fontSize="sm" mb={0.5}>
                                            {item.title}
                                        </Text>
                                        <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} lineHeight="short">
                                            {item.desc}
                                        </Text>
                                    </Box>
                                </Flex>
                            ))}
                        </Grid>

                        <Flex alignItems="center" gap={3} mt={2}>
                            <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                                {isUndergrad ? "Undergraduate" : "Graduate"}
                            </Text>
                            <Box
                                as="button"
                                onClick={onModeChange}
                                w="44px"
                                h="22px"
                                borderRadius="full"
                                bg={accentColor}
                                position="relative"
                                transition="all 0.2s ease"
                                cursor="pointer"
                                _hover={{ opacity: 0.9 }}
                            >
                                <Box
                                    w="18px"
                                    h="18px"
                                    borderRadius="full"
                                    bg="white"
                                    position="absolute"
                                    top="2px"
                                    left={isUndergrad ? "2px" : "22px"}
                                    transition="all 0.2s ease"
                                    boxShadow="sm"
                                />
                            </Box>
                            <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                                {isUndergrad ? "Graduate" : "Undergraduate"}
                            </Text>
                        </Flex>
                    </Flex>
                </GlassBox>
            </Flex>
        </Box>
    );
};

export default FrontPageInfo;
