import React from 'react';
import { Button, ButtonProps, useColorMode } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface ColumnPopoverButtonProps extends ButtonProps {
  isActivated?: boolean;
  isOpen?: boolean;
}

const ColumnPopoverButton: React.FC<ColumnPopoverButtonProps> = ({
  isActivated = false,
  isOpen = false,
  children,
  ...props
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const getBackgroundColor = () => {
    if (isActivated) return isDark ? 'brand.600' : 'brand.500';
    if (isOpen) return isDark ? 'whiteAlpha.100' : 'gray.50';
    return 'transparent';
  };

  const getHoverBackgroundColor = () => {
    if (isActivated) return isDark ? 'brand.700' : 'brand.600';
    return isDark ? 'whiteAlpha.100' : 'gray.50';
  };

  const getTextColor = () => {
    if (isActivated) return 'white';
    return isDark ? 'gray.300' : 'gray.600';
  };

  return (
    <Button
      variant="ghost"
      size={{ base: "xs", md: "sm" }}
      fontWeight="600"
      rightIcon={<ChevronDownIcon boxSize={{ base: 3, md: 4 }} />}
      borderRadius="lg"
      whiteSpace="normal"
      height="auto"
      minHeight={{ base: "36px", md: "42px" }}
      maxWidth="160px"
      lineHeight="short"
      paddingX={{ base: 2, md: 3 }}
      width="full"
      bg={getBackgroundColor()}
      color={getTextColor()}
      _hover={{
        bg: getHoverBackgroundColor(),
        color: isActivated ? 'white' : isDark ? 'white' : 'gray.800',
      }}
      transition="all 0.15s ease"
      zIndex={isOpen ? "popover" : "auto"}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ColumnPopoverButton;
