import React from 'react';
import { ModeType } from "../helpers/types";
import { Box, Text, Switch, useColorMode } from '@chakra-ui/react';

interface ModeToggleProps {
  mode: ModeType;
  onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  const isUndergrad = mode === ModeType.Undergrad;
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Text
        fontSize="xs"
        fontWeight="500"
        whiteSpace="nowrap"
        color={isDark ? 'gray.400' : 'gray.500'}
      >
        {isUndergrad ? 'Undergrad' : 'Grad'}
      </Text>
      <Switch
        isChecked={!isUndergrad}
        onChange={onToggle}
        size="sm"
        colorScheme="blue"
      />
    </Box>
  );
};

export default ModeToggle;
