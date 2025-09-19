import { useColorMode, useTheme } from '@chakra-ui/react';

export const useAppTheme = () => {
  const theme = useTheme();
  const { colorMode } = useColorMode();
  
  return {
    theme,
    colorMode,
    isDark: colorMode === 'dark',
    isLight: colorMode === 'light',
    glassBg: colorMode === 'dark' 
      ? 'rgba(26, 32, 44, 0.2)' 
      : 'rgba(255, 255, 255, 0.2)',
    glassBorder: colorMode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.2)',
    modeColor: (undergradColor: string, gradColor: string, mode: 'undergrad' | 'grad') => 
      mode === 'undergrad' ? undergradColor : gradColor,
  };
};