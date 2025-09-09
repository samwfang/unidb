import { Box, Flex, Text, Badge, Button, useColorMode } from '@chakra-ui/react';
import { ModeType } from '../App';
import UGradGradToggle from '../UGradGradToggle';


interface TopHeaderProps {
    mode: ModeType;
    showHeader: boolean;
    onToggle: () => void;
}

export default function TopHeader({ mode, showHeader, onToggle }: TopHeaderProps) {
     const { toggleColorMode } = useColorMode(); // Add this line

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
            bg={mode === ModeType.Undergrad ? "blue.50" : "gray.50"}
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
                        <Text fontSize={{base: "lg", md: "2xl"}} fontWeight="bold">
                            unidb
                        </Text>
                    </Flex>
                    <Box>
                        <UGradGradToggle mode={mode} onToggle={onToggle} />
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
}