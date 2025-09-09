import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { ModeType } from '../App';
import { ChatIcon, InfoIcon, StarIcon, SearchIcon } from '@chakra-ui/icons';
import { FaHeart } from 'react-icons/fa';

interface NavigationFooterProps {
  mode: ModeType;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationFooter: React.FC<NavigationFooterProps> = ({ mode, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'explore', icon: SearchIcon, label: 'UniDB' },
    {id: 'favorites', icon: FaHeart, label: "Favorites"},
    { id: 'chat', icon: ChatIcon, label: 'UniChat' },
    { id: 'facultydb', icon: StarIcon, label: 'FacultyDB' },
    { id: 'about', icon: InfoIcon, label: 'About' }
  ];

  const getBgColor = () => {
    return mode === ModeType.Undergrad ? "blue.50" : "gray.50";
  };

  const getActiveColor = () => {
    return mode === ModeType.Undergrad ? "blue.500" : "purple.600";
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={getBgColor()}
      borderTop="1px solid"
      borderColor="gray.200"
      p={2}
      boxShadow="sm"
    >
      <Flex justify="space-around" align="center">
        {navItems.map((item) => (
          <Flex
            key={item.id}
            direction="column"
            align="center"
            cursor="pointer"
            onClick={() => onTabChange(item.id)}
            color={activeTab === item.id ? getActiveColor() : "gray.500"}
            _hover={{ color: getActiveColor() }}
            transition="color 0.2s"
            flex={1}

            position="relative"
          >
            <Icon as={item.icon} boxSize={5} mb={1} />
            <Text fontSize="xs" fontWeight={activeTab === item.id ? "bold" : "normal"}>
              {item.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default NavigationFooter;