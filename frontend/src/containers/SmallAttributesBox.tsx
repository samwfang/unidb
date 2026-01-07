import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface SmallAttributeBoxProps extends BoxProps { }

const SmallAttributeBox: React.FC<SmallAttributeBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      bg={colorMode === "dark" ? "gray.900" : "white"}
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}
      borderRadius="lg"
      boxShadow={colorMode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)'}
      p={1.5}
      minW="0"
      textAlign="center"
      height="100%"

      {...props}
    >
      {children}
    </Box>
  );
};

export default SmallAttributeBox;