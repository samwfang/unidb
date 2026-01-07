import { Box, Flex, Text, Badge, Button, useColorMode } from '@chakra-ui/react';
import { ModeType } from "../helpers/types";
import UGradGradToggle from './UGradGradToggle';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';


interface TopHeaderProps {
    mode: ModeType;
    showHeader: boolean;
    onToggle: () => void;
    onColorModeToggle: () => void;
    colorMode: string;
}

export default function TopHeader({ mode, showHeader, onToggle, onColorModeToggle, colorMode }: TopHeaderProps) {
    const { toggleColorMode } = useColorMode(); // Add this line

    const bgColor = colorMode === 'dark'
        ? 'gray.900'  // Black background for dark mode
        : mode === ModeType.Undergrad ? "blue.50" : "gray.50";

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={10000}
            opacity={showHeader ? 1 : 0}
            transition="opacity 0.3s ease"
            pointerEvents={showHeader ? 'auto' : 'none'}
            bg={bgColor}
            boxShadow="sm"
            p={1.5}
        >
            <Flex
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="space-around"
                textAlign="left"
                pl={8}
                mt={2}
            >
                <Flex
                    width="100%"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    position="relative"
                    flexWrap="wrap"  // Added to allow wrapping
                    gap={2}
                >
                    <Flex alignItems="center">
                        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                            unidb
                        </Text>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                        <Button
                            onClick={onColorModeToggle}
                            size="sm"
                            variant="ghost"
                            aria-label="Toggle color mode"
                        >
                            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        </Button>
                        <Box>
                            <UGradGradToggle mode={mode} onToggle={onToggle} />
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
}