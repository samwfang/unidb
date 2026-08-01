import React from 'react';
import { Flex, Circle, Text, Button, useColorMode } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import GlassBox from '../../containers/GlassBox';

interface GradModePlaceholderProps {
  toggleMode: () => void;
}

const GradModePlaceholder: React.FC<GradModePlaceholderProps> = ({ toggleMode }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <GlassBox
      maxW={{ base: "100%", md: "1100px" }}
      mx="auto"
      position="relative"
      p={{ base: 3, md: 5 }}
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minH="300px"
        py={8}
        px={4}
        gap={3}
      >
        <Circle
          size="64px"
          bg={isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.1)'}
        >
          <WarningIcon color={isDark ? 'purple.400' : 'purple.500'} boxSize={7} />
        </Circle>
        <Text fontSize="xl" fontWeight="600" color={isDark ? 'gray.100' : 'gray.800'}>
          Graduate Mode is Under Construction
        </Text>
        <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} maxW="420px" lineHeight="tall">
          We're currently building graduate program data. Please check back soon, or explore undergraduate programs in the meantime.
        </Text>
        <Button mt={2} variant="primary" size="sm" onClick={toggleMode}>
          Explore Undergraduate Mode
        </Button>
      </Flex>
    </GlassBox>
  );
};

export default GradModePlaceholder;
