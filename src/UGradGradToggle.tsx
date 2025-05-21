import React from 'react';
import { ModeType } from './App';
import {Box, Text, Switch} from '@chakra-ui/react';

interface ModeToggleProps {
  mode: ModeType;
  onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  const isUndergrad = mode === ModeType.Undergrad;

  return (
    <Box display="flex" alignItems="right">
      <Text mr={2}>{isUndergrad ? 'Undergraduate' : 'Graduate'}</Text>
      <Switch
        isChecked={!isUndergrad}
        onChange={onToggle}
        colorScheme={isUndergrad ? 'blue' : 'green'}
        sx={{
          '.chakra-switch__track': {
            bg: isUndergrad ? 'blue.500' : 'green.500',
          },
        }}
      />
    </Box>
  );
};

export default ModeToggle;
