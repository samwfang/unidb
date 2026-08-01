import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import GlassBox from "../../containers/GlassBox";

interface PlaceholderPageProps {
    title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    return (
        <Flex
            maxW="1100px"
            w="100%"
            px={{ base: 4, md: 8 }}
            mx="auto"
            justify="center"
            align="center"
        >
            <GlassBox p={{ base: 8, md: 12 }} w="100%">
                <Flex direction="column" alignItems="center" gap={4} textAlign="center">
                    <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="bold"
                        bgGradient="linear(to-r, brand.400, brand.600)"
                        bgClip="text"
                        letterSpacing="tight"
                    >
                        {title}
                    </Text>
                    <Text
                        fontSize="sm"
                        color={isDark ? 'gray.400' : 'gray.500'}
                    >
                        This page is coming soon.
                    </Text>
                </Flex>
            </GlassBox>
        </Flex>
    );
};

export default PlaceholderPage;
