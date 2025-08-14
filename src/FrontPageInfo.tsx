import { Badge, Box, Button, Circle, Flex, List, ListIcon, ListItem, Switch, Text } from "@chakra-ui/react";
import { ModeType } from "./App";
import UGradGradToggle from "./UGradGradToggle";
import { CheckCircleIcon } from "@chakra-ui/icons";

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
                        <Box textAlign="left" w="100%" pl={4} mt={4} mb={4}>
                            {isUndergrad ? (
                                <>
                                    <List spacing={1.5}>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color="blue.500" />
                                            Compare and Score Undergraduate Programs
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color="blue.500" />
                                            View Demographics, Admission Statistics, and Tuition Costs
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color=" blue.500" />
                                            Check How Recent Alumni Are Doing
                                        </ListItem>

                                    </List>
                                </>
                            ) : (
                                <>
                                      <List spacing={1.5}>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color="gray.500" />
                                            Compare and Score Graduate Programs
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color="gray.500" />
                                            Check if Research Labs Are Accepting Candidates
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon as={CheckCircleIcon} color="gray.500" />
                                            Find and Search Faculty Research Interests
                                        </ListItem>

                                    </List>
                                </>
                            )}
                        </Box>

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
