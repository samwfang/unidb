import React from 'react';
import { Flex, Circle, Text, Button, useColorMode } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import GlassBox from '../../containers/GlassBox';

const FacultyDBPlaceholder: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const navigate = useNavigate();

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
          bg={isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.1)'}
        >
          <StarIcon color={isDark ? 'indigo.300' : 'indigo.500'} boxSize={7} />
        </Circle>
        <Text fontSize="xl" fontWeight="600" color={isDark ? 'gray.100' : 'gray.800'}>
          FacultyDB is Under Construction
        </Text>
        <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} maxW="420px" lineHeight="tall">
          We're currently building the faculty database. Please check back soon, or explore universities in the meantime.
        </Text>
        <Button mt={2} variant="primary" size="sm" onClick={() => navigate('/')}>
          Explore Universities
        </Button>
      </Flex>
    </GlassBox>
  );
};

export default FacultyDBPlaceholder;
