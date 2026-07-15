import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface SmallAttributeBoxProps extends BoxProps { }

const SmallAttributeBox: React.FC<SmallAttributeBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      bg={isDark ? 'rgba(255, 255, 255, 0.03)' : 'gray.50'}
      border="1px solid"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
      borderRadius="lg"
      p={2}
      minW="0"
      textAlign="center"
      height="100%"
      transition="all 0.15s ease"
      {...props}
    >
      {children}
    </Box>
  );
};

export default SmallAttributeBox;
