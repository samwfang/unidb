import { Badge, Box, Button, Circle, Flex, Icon, List, ListIcon, ListItem, Switch, Text } from "@chakra-ui/react";
import { ModeType } from "../Root/App";
import UGradGradToggle from "./UGradGradToggle";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { FiCircle } from 'react-icons/fi';
import { Grid, Avatar } from '@chakra-ui/react';
import { StarIcon, ViewIcon, SearchIcon, SmallAddIcon } from '@chakra-ui/icons';
import React from "react";

interface FrontPageInfoProps {
    mode: ModeType;
    onModeChange: () => void;
    onFindCollegesClick: () => void;
};
const FrontPageInfo: React.FC<FrontPageInfoProps> = ({ mode, onModeChange, onFindCollegesClick }) => {
    const isUndergrad = mode === ModeType.Undergrad;

    return (

        <Box w={{ base: "100%", md: "1000px" }} alignItems="center" mx="auto" mt="8"
            p={6}
        >
            <Flex direction="column" alignItems="center" gap={4} p={3}>
                <Flex direction="column" alignItems="center">
                    <Text fontSize="3xl" fontWeight="bold">
                        unidb
                    </Text>
                    <Text fontSize={{base: "3xl", md: "5xl"}} fontWeight="normal">
                        The University Database
                    </Text>
                    <Badge fontSize='1em' colorScheme="blue" ml={1}>
                        Demo
                    </Badge>
                </Flex>

                <Flex direction="column" alignItems="center">
                    <Text fontSize="lg">
                        A One-Stop Shop To Find Information about U.S. Colleges and Professors.
                    </Text>

                </Flex>
                <Flex alignItems="center" gap={4}>
                    <Button bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
                        color="white"
                        _hover={{
                            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
                            color: 'white',
                        }}
                        onClick={onFindCollegesClick}>
                        Find Colleges
                    </Button>
                    <Button bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
                        color="white"
                        _hover={{
                            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
                            color: 'white',
                        }}>
                        Find Faculty
                    </Button>
                </Flex>

                <Box w={{ base: "100%", md: "700px" }} mx="auto" mt="8"
                    bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
                    backdropFilter="blur(16px)"  // Applies the frosted glass effect
                    borderRadius="lg"            // Rounds the corners of the box
                    boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
                    border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
                    p={6}
                >
                    <Flex direction="column" alignItems="center" gap={2}>
                        <Text fontSize="2xl" fontWeight="bold">
                            {isUndergrad ? "Undergraduate Mode" : "Graduate Mode"}
                        </Text>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} width="100%">
                            {isUndergrad ? (
                                <>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<StarIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Find The Right College</Text>
                                                <Text fontSize="sm" color="gray.600">Score programs side-by-side using custom criteria</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box  p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<ViewIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Student Population</Text>
                                                <Text fontSize="sm" color="gray.600">View student makeup and post-graduation metrics</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<ViewIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Admissions Info</Text>
                                                <Text fontSize="sm" color="gray.600">Check acceptance criteria and rates</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<ViewIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Financial Info</Text>
                                                <Text fontSize="sm" color="gray.600">Compare tuition costs and financial aid</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SearchIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Find The Right Lab</Text>
                                                <Text fontSize="sm" color="gray.600">Find research groups currently looking for students</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SmallAddIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Faculty Directory</Text>
                                                <Text fontSize="sm" color="gray.600">Search faculty research interests and previous work</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SmallAddIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Admissions Criteria</Text>
                                                <Text fontSize="sm" color="gray.600">Check acceptance criteria and rates</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SmallAddIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Student Population</Text>
                                                <Text fontSize="sm" color="gray.600">View student makeup and post-graduation metrics</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                </>
                            )}
                        </Grid>

                        <Switch size="lg"
                            isChecked={!isUndergrad}
                            onChange={onModeChange}
                            colorScheme={isUndergrad ? 'blue' : 'green'}
                            sx={{
                                '.chakra-switch__track': {
                                    bg: isUndergrad ? 'blue.500' : 'gray.500',
                                },
                            }}
                        />
                    </Flex>

                </Box>


            </Flex>

        </Box>
    );
};

export default FrontPageInfo;
