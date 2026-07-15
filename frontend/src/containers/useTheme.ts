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
      ? 'rgba(20, 24, 36, 0.6)'
      : 'rgba(255, 255, 255, 0.7)',
    glassBorder: colorMode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.06)',
    modeColor: (undergradColor: string, gradColor: string, mode: 'undergrad' | 'grad') =>
      mode === 'undergrad' ? undergradColor : gradColor,
  };
};
