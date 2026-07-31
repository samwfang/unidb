import React from 'react';
import { Box, Button, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody, Text, useColorMode } from '@chakra-ui/react';
import { InfoIcon, WarningIcon } from '@chakra-ui/icons';

interface DataInfoPopoverProps {
  title?: string;
  source?: string;
  isWarning?: boolean;
  top?: string | number;
  right?: string | number;
}

const DataInfoPopover: React.FC<DataInfoPopoverProps> = ({
  title = "Data Source",
  source = "U.S. Department of Education College Scorecard 2026",
  isWarning = false,
  top = 1.5,
  right = 1.5,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Popover trigger="hover" placement="bottom-end" openDelay={50} closeDelay={100}>
      <PopoverTrigger>
        <Box
          as="button"
          aria-label={isWarning ? "Data quality warning" : "Data source information"}
          position="absolute"
          top={top}
          right={right}
          w={isWarning ? "22px" : "18px"}
          h={isWarning ? "22px" : "18px"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          p="0"
          appearance="none"
          cursor="pointer"
          zIndex={1}
          opacity={isWarning ? 1 : 0.55}
          color={isWarning
            ? (isDark ? 'orange.300' : 'orange.500')
            : (isDark ? 'gray.400' : 'gray.500')}
          _hover={{
            opacity: 1,
            color: isWarning
              ? (isDark ? 'orange.200' : 'orange.400')
              : 'brand.500',
          }}
          transition="all 0.15s ease"
        >
          {isWarning ? <WarningIcon boxSize="16px" flexShrink={0} /> : <InfoIcon boxSize="12px" flexShrink={0} />}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        width="auto"
        maxW="260px"
        borderRadius="md"
        boxShadow="lg"
        bg={isDark ? 'gray.700' : 'white'}
        border="1px solid"
        borderColor={isDark ? 'gray.600' : 'gray.200'}
      >
        <PopoverBody p={3}>
            <Text fontSize="xs" fontWeight="600" mb={1} color={isDark ? 'gray.200' : 'gray.700'}>
              {title}
            </Text>
            <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'}>
              {source}
            </Text>
            {isWarning && (
              <Flex
                mt={2}
                alignItems="center"
                gap={1.5}
                bg={isDark ? 'rgba(234, 179, 8, 0.12)' : 'yellow.50'}
                border="1px solid"
                borderColor={isDark ? 'rgba(234, 179, 8, 0.25)' : 'yellow.200'}
                borderRadius="md"
                px={2}
                py={1.5}
              >
                <WarningIcon boxSize="12px" color={isDark ? 'yellow.300' : 'yellow.600'} flexShrink={0} />
                <Text fontSize="xs" color={isDark ? 'yellow.200' : 'yellow.700'}>
                  The data in this graphic was estimated from existing data and may not be accurate
                </Text>
              </Flex>
            )}
            <Button
              mt={3}
              w="100%"
              variant="secondary"
              size="sm"
              isDisabled
              cursor="not-allowed"
              opacity={0.5}
            >
              Request Update
            </Button>
          </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default DataInfoPopover;
