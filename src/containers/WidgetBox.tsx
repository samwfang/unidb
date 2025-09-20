import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface WidgetBoxProps extends BoxProps {}

const WidgetBox: React.FC<WidgetBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      bg={colorMode === 'dark' ? 'rgba(26, 32, 44)' : 'rgba(255, 255, 255)'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}
      borderRadius="lg"
      boxShadow={colorMode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)'}
      color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
      {...props}
    >
      {children}
    </Box>
  );
};

export default WidgetBox;