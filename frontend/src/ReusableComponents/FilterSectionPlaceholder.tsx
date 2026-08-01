import { Box, Stack, Text, Button, IconButton, useColorMode } from '@chakra-ui/react';
import { SmallAddIcon, MinusIcon } from '@chakra-ui/icons';
import { useState } from 'react';

const MAX_FILTERS = 5;

interface FilterSectionPlaceholderProps {
  title?: string;
}

//Placeholder filter UI. Each page passes its own filterSection to the control
//panel; this default keeps the placeholder look until real filters exist.
const FilterSectionPlaceholder: React.FC<FilterSectionPlaceholderProps> = ({ title = 'Filters' }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [filters, setFilters] = useState<number[]>([]);

  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="600"
        color={isDark ? 'gray.400' : 'gray.500'}
        mb={2}
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {title}
      </Text>
      <Stack spacing={2}>
        {filters.map((id, index) => (
          <Box
            key={id}
            position="relative"
            p={3}
            borderRadius="lg"
            border="1px dashed"
            borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
            bg={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
          >
            <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'}>
              Filter {index + 1}
            </Text>
            <IconButton
              aria-label={`Remove filter ${index + 1}`}
              icon={<MinusIcon />}
              size="xs"
              position="absolute"
              top={1}
              right={1}
              variant="ghost"
              onClick={() => setFilters((prev) => prev.filter((f) => f !== id))}
            />
          </Box>
        ))}
        <Button
          size="sm"
          variant="secondary"
          w="100%"
          leftIcon={<SmallAddIcon />}
          onClick={() => setFilters((prev) => [...prev, prev.length ? prev[prev.length - 1] + 1 : 0])}
          isDisabled={filters.length >= MAX_FILTERS}
        >
          Add Filter
        </Button>
      </Stack>
    </Box>
  );
};

export default FilterSectionPlaceholder;
