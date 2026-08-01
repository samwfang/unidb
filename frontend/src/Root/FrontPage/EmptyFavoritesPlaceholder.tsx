import React from 'react';
import { Flex, Circle, Text, Button, Icon, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import GlassBox from '../../containers/GlassBox';

const EmptyFavoritesPlaceholder: React.FC = () => {
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
          bg={isDark ? 'rgba(236, 72, 153, 0.12)' : 'rgba(236, 72, 153, 0.1)'}
        >
          <Icon viewBox="0 0 24 24" color={isDark ? 'pink.400' : 'pink.500'} boxSize={7}>
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </Icon>
        </Circle>
        <Text fontSize="xl" fontWeight="600" color={isDark ? 'gray.100' : 'gray.800'}>
          Favorites are empty
        </Text>
        <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} maxW="420px" lineHeight="tall">
          You haven't saved any universities yet. Tap the heart on any university to add it to your favorites.
        </Text>
        <Button mt={2} variant="primary" size="sm" onClick={() => navigate('/')}>
          Explore Universities
        </Button>
      </Flex>
    </GlassBox>
  );
};

export default EmptyFavoritesPlaceholder;
