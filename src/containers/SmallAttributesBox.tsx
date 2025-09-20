import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface SmallAttributeBoxProps extends BoxProps { }

const SmallAttributeBox: React.FC<SmallAttributeBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      bg={colorMode === "dark" ? "gray.900" : "white"}
      borderRadius="lg"
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