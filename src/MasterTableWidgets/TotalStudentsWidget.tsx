// GraduationRateWidget.tsx
import React from 'react';
import { Box, Text, Alert, AlertIcon} from '@chakra-ui/react';

interface GraduationRateWidgetProps {
  totalStudents: string;
}

const GraduationRateWidget: React.FC<GraduationRateWidgetProps> = ({ totalStudents }) => {
  return (
    <Box p={4} 
      borderWidth={1} 
      borderRadius="md" 
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="120px">
      <Text fontSize="2xl" fontWeight="bold">Number of Students</Text>
      <Text fontSize="2xl" fontWeight="bold">{totalStudents}</Text>
      <Alert status="info"
              variant="subtle"
              borderRadius="md"
              padding="2" // Reduce padding for a smaller appearance
              fontSize="sm" // Smaller font size
              >
              <AlertIcon />
              <p><b>76th </b> Percentile in <b> Number of Students</b></p>
             </Alert>
    </Box>
  );
};

export default GraduationRateWidget;