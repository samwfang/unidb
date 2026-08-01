import { useState } from "react";
import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import { MTControlPanel } from "../FrontPage/MTControlPanel";
import FavoritesTable from "../FrontPage/FavoritesTable";
import { ModeType } from "../../helpers/types";

interface FavoritesPageProps {
    mode: ModeType;
    onModeChange: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ mode, onModeChange }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const [pageSize, setPageSize] = useState<number>(10);

    return (
        <>
            <Box w="100%" maxW="1100px" mx="auto" px={{ base: 4, md: 8 }}  mb={8}>
                <Flex direction="column" alignItems="center" gap={3} textAlign="center">
                    <Text
                        fontSize={{ base: "2xl", md: "3xl" }}
                        mt={{ base: 12, md: 16 }}
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
                        Favorites
                    </Text>
                </Flex>
            </Box>

            <Flex
                direction={{ base: "column", lg: "row" }}
                gap={6}
                mt={8}
                maxW="1300px"
                mx="auto"
                w="100%"
                px={{ base: 4, md: 8 }}
                alignItems="flex-start"
            >
                <MTControlPanel
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    mode={mode}
                    onModeChange={onModeChange}
                />

                <Box flex={1} w="100%" minW={0}>
                    <FavoritesTable />
                </Box>
            </Flex>
        </>
    );
};

export default FavoritesPage;
