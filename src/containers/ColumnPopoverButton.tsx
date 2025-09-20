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
    if (isActivated) return isDark ? 'green.600' : 'green.500';
    if (isOpen) return isDark ? 'gray.700' : 'gray.100';
    return 'transparent';
  };

  const getHoverBackgroundColor = () => {
    if (isActivated) return isDark ? 'green.700' : 'green.600';
    return isDark ? 'gray.600' : 'gray.100';
  };

  const getTextColor = () => {
    if (isActivated) return 'white';
    return isDark ? 'white' : 'black';
  };

  const getHoverTextColor = () => {
    if (isActivated) return 'white';
    return isDark ? 'white' : 'black';
  };

  return (
    <Button
      variant="outline"
      size={{ base: "xs", md: "sm" }}
      fontWeight="bold"
      rightIcon={<ChevronDownIcon boxSize={{ base: 3, md: 4 }} />}
      borderColor={isDark ? "gray.600" : "gray.200"}
      borderRadius="md"
      whiteSpace="normal"
      height="auto"
      minHeight={{ base: "36px", md: "42px" }}
      lineHeight="short"
      paddingX={{ base: 1, md: 2 }}
      width="full"
      bg={getBackgroundColor()}
      color={getTextColor()}
      _hover={{
        bg: getHoverBackgroundColor(),
        color: getHoverTextColor(),
        transform: 'none',
      }}
      zIndex={isOpen ? "popover" : "auto"}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ColumnPopoverButton;