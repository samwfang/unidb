import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";

const UniChatPage: React.FC = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Box w="100%" maxW="1100px" mx="auto" px={{ base: 4, md: 8 }} mb={8}>
            <Flex direction="column" alignItems="center" gap={3} textAlign="center">
                <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="bold"
                    bgGradient="linear(to-r, brand.400, brand.600)"
                    bgClip="text"
                    letterSpacing="tight"
                    mt={{ base: 12, md: 16 }}
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
                    UniChat
                </Text>
                <Text
                    fontSize={{ base: "sm", md: "md" }}
                    color={isDark ? 'gray.400' : 'gray.500'}
                    textAlign="center"
                    maxW="500px"
                >
                    This page is coming soon.
                </Text>
            </Flex>
        </Box>
    );
};

export default UniChatPage;
