import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface GlassBoxProps extends BoxProps {}

const GlassBox: React.FC<GlassBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      bg={isDark ? 'rgba(20, 24, 36, 0.6)' : 'rgba(255, 255, 255, 0.7)'}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
      borderRadius="2xl"
      boxShadow={isDark
        ? '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        : '0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassBox;
