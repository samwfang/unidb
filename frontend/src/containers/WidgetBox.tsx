import { Box, BoxProps } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';

interface WidgetBoxProps extends BoxProps {}

const WidgetBox: React.FC<WidgetBoxProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      bg={isDark ? 'rgba(20, 24, 36, 0.5)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}
      borderRadius="xl"
      boxShadow={isDark
        ? '0 2px 12px rgba(0, 0, 0, 0.2)'
        : '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)'}
      color={isDark ? 'gray.100' : 'gray.700'}
      transition="box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        boxShadow: isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.06)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default WidgetBox;
