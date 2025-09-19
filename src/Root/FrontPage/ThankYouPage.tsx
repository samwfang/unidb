import { Badge, Box, Button, Flex, Switch, Text } from "@chakra-ui/react";
import { ModeType } from "../App";
import UGradGradToggle from "../../ReusableComponents/UGradGradToggle";

interface ThankYouPageProps {
    mode: ModeType;
    onModeChange: () => void;
};
const ThankYouPage: React.FC<ThankYouPageProps> = ({ mode, onModeChange }) => {
    const isUndergrad = mode === ModeType.Undergrad;

    return (

        <Box w="100%" alignItems="center" mx="auto" mt="8"
            p={6}
        >
            <Flex direction="column" alignItems="center" gap={4} p={3}>
                <Flex direction="column" alignItems="center">
                    <Text fontSize="xl" fontWeight="bold">
                        Thank you for trying out
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                        The University Database
                    </Text>
                    <Badge fontSize='1em' colorScheme="blue" ml={1}>
                        Demo
                    </Badge>
                </Flex>

                <Flex direction="column" alignItems="center">
                    <Text fontSize="lg">
                        We're Looking to Add Cool New Features
                    </Text>
                    <Text fontSize="lg"> And Want Your Feedback!</Text>

                </Flex>
                <Flex alignItems="center" gap={4}>
                    <Button bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
                        color="white"
                        _hover={{
                            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
                            color: 'white',
                        }}>
                        Contact Us
                    </Button>
                    <Button bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
                        color="white"
                        _hover={{
                            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
                            color: 'white',
                        }}>
                        View Roadmap
                    </Button>
                </Flex>
                
                <Box w="60%" mx="auto" mt="8"
                      bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
                      backdropFilter="blur(16px)"  // Applies the frosted glass effect
                      borderRadius="lg"            // Rounds the corners of the box
                      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
                      border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
                      p={6}
                    >
                    Placeholder
                    </Box>
                

            </Flex>

        </Box>
    );
};

export default ThankYouPage;
