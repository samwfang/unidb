import React from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { ModeType } from "../helpers/types";
import { ChatIcon, InfoIcon, StarIcon, SearchIcon } from '@chakra-ui/icons';
import { FaHeart } from 'react-icons/fa';

interface NavigationFooterProps {
  mode: ModeType;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationFooter: React.FC<NavigationFooterProps> = ({ mode, activeTab, onTabChange }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const navItems: Array<{ id: string; icon: any; label: string }> = [
    { id: 'explore', icon: SearchIcon, label: 'UniDB' },
    { id: 'favorites', icon: FaHeart, label: 'Favorites' },
    { id: 'chat', icon: ChatIcon, label: 'UniChat' },
    { id: 'facultydb', icon: StarIcon, label: 'FacultyDB' },
    { id: 'about', icon: InfoIcon, label: 'About' }
  ];

  const getActiveColor = () => {
    return mode === ModeType.Undergrad ? 'brand.500' : 'purple.500';
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={10000}
      bg={isDark ? 'rgba(15, 17, 23, 0.85)' : 'rgba(248, 250, 252, 0.9)'}
      backdropFilter="blur(16px)"
      borderTop="1px solid"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}
      py={2}
      px={4}
    >
      <Flex justify="space-around" align="center" maxW="500px" mx="auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Flex
              key={item.id}
              direction="column"
              align="center"
              cursor="pointer"
              onClick={() => onTabChange(item.id)}
              color={isActive ? getActiveColor() : isDark ? 'gray.500' : 'gray.400'}
              _hover={{ color: getActiveColor() }}
              transition="color 0.15s ease"
              flex={1}
              position="relative"
              gap={{ base: 0.5, md: 1 }}
              minH={{ base: "44px" }}
              py={{ base: 0.5, md: 1 }}
            >
              {isActive && (
                <Box
                  position="absolute"
                  top="-8px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="4"
                  h="0.5"
                  borderRadius="full"
                  bg={getActiveColor()}
                />
              )}
              <Icon as={item.icon} boxSize={{ base: 4, md: 5 }} />
              <Text
                fontSize={{ base: "9px", sm: "10px", md: "11px" }}
                fontWeight={isActive ? '600' : '400'}
                letterSpacing="tight"
              >
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default NavigationFooter;
