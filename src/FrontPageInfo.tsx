import { Badge, Box, Button, Circle, Flex, Icon, List, ListIcon, ListItem, Switch, Text } from "@chakra-ui/react";
import { ModeType } from "./App";
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
                        Welcome to
                    </Text>
                    <Text fontSize="5xl" fontWeight="bold">
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

                <Box w={{ base: "100%", md: "600px" }} mx="auto" mt="8"
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
                                    <Box bg="blue.50" p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<StarIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Compare & Rank</Text>
                                                <Text fontSize="sm" color="gray.600">Score programs side-by-side</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box bg="blue.50" p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="blue.500" color="white" icon={<ViewIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Student Stats</Text>
                                                <Text fontSize="sm" color="gray.600">View demographics & outcomes</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box bg="purple.50" p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SearchIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Research Labs</Text>
                                                <Text fontSize="sm" color="gray.600">Find open positions</Text>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Box bg="purple.50" p={3} borderRadius="md">
                                        <Flex alignItems="flex-start">
                                            <Avatar size="sm" bg="purple.500" color="white" icon={<SmallAddIcon />} mr={3} />
                                            <Box>
                                                <Text fontWeight="bold" mb={1}>Faculty Interests</Text>
                                                <Text fontSize="sm" color="gray.600">Search by research area</Text>
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
