// GraduationRateWidget.tsx
import React from 'react';
import { Box, Text, Alert, AlertIcon} from '@chakra-ui/react';

interface GraduationRateWidgetProps {
  graduationRate: string;
}

const GraduationRateWidget: React.FC<GraduationRateWidgetProps> = ({ graduationRate }) => {
  return (
    <Box 
      p={4} 
      borderWidth={1} 
      borderRadius="md" 
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
      //backdropFilter="blur(16px)"  // Applies the frosted glass effect      // Rounds the corners of the box
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
      border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
    >
      <Box>
        <Text fontSize="2xl" fontWeight="bold">Graduation Rate</Text>
        <Text fontSize="3xl" fontWeight="bold">{graduationRate}</Text>
      </Box>
      
      <Alert 
        status="info"
        variant="subtle"
        borderRadius="md"
        padding="2" // Reduce padding for a smaller appearance
        fontSize="sm" // Smaller font size
      >
        <AlertIcon />
        Higher Graduation Rate than 97% of Colleges
      </Alert>
    </Box>
  );
};

export default GraduationRateWidget;