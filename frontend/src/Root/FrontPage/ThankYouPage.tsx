import { Box, Button, Flex, Text, useColorMode } from "@chakra-ui/react";
import { ModeType } from "../../helpers/types";
import GlassBox from "../../containers/GlassBox";

interface ThankYouPageProps {
    mode: ModeType;
    onModeChange: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ mode, onModeChange }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Box w="100%" mx="auto" mt={12} mb={8}>
            <GlassBox p={{ base: 6, md: 8 }}>
                <Flex direction="column" alignItems="center" gap={4}>
                    <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="600"
                        color={isDark ? 'gray.100' : 'gray.800'}
                    >
                        Thank you for trying out
                    </Text>
                    <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="bold"
                        bgGradient="linear(to-r, brand.400, brand.600)"
                        bgClip="text"
                        letterSpacing="tight"
                    >
                        The University Database
                    </Text>

                    <Text
                        fontSize="sm"
                        color={isDark ? 'gray.400' : 'gray.500'}
                        textAlign="center"
                    >
                        We're looking to add new features and want your feedback!
                    </Text>

                    <Flex alignItems="center" gap={3} mt={2}>
                        <Button variant="primary" size="sm" px={5}>
                            Contact Us
                        </Button>
                        <Button variant="secondary" size="sm" px={5}>
                            View Roadmap
                        </Button>
                    </Flex>
                </Flex>
            </GlassBox>
        </Box>
    );
};

export default ThankYouPage;
