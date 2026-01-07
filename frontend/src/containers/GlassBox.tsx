import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface GlassBoxProps extends BoxProps {}

const GlassBox: React.FC<GlassBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      bg={colorMode === 'dark' ? 'rgba(26, 32, 44, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}
      borderRadius="lg"
      boxShadow={colorMode === 'dark' ? '0 4px 30px rgba(0, 0, 0, 0.3)' : '0 4px 30px rgba(0, 0, 0, 0.1)'}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassBox;