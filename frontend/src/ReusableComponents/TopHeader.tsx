import { Box, Flex, Text, Button } from '@chakra-ui/react';
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
    const isDark = colorMode === 'dark';

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={10000}
            opacity={showHeader ? 1 : 0}
            transition="all 0.3s ease"
            pointerEvents={showHeader ? 'auto' : 'none'}
            transform={showHeader ? 'translateY(0)' : 'translateY(-4px)'}
            bg={isDark ? 'rgba(15, 17, 23, 0.8)' : 'rgba(248, 250, 252, 0.85)'}
            backdropFilter="blur(16px)"
            borderBottom="1px solid"
            borderColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}
            boxShadow={isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)'}
        >
            <Flex
                maxW="1300px"
                mx="auto"
                px={{ base: 4, md: 8 }}
                py={2.5}
                alignItems="center"
                justifyContent="space-between"
            >
                <Flex alignItems="center" gap={2}>
                    <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="bold"
                        bgGradient="linear(to-r, brand.400, brand.600)"
                        bgClip="text"
                        letterSpacing="tight"
                    >
                        unidb
                    </Text>
                </Flex>
                <Flex alignItems="center" gap={3}>
                    <Button
                        onClick={onColorModeToggle}
                        size="sm"
                        variant="ghost"
                        aria-label="Toggle color mode"
                        borderRadius="full"
                        p={2}
                    >
                        {isDark ? <SunIcon boxSize={4} /> : <MoonIcon boxSize={4} />}
                    </Button>
                    <UGradGradToggle mode={mode} onToggle={onToggle} />
                </Flex>
            </Flex>
        </Box>
    );
}
