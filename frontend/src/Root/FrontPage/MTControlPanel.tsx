import { Box, Stack, Text, Select, Button, IconButton, useColorMode } from '@chakra-ui/react';
import { SmallAddIcon, MinusIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import UGradGradToggle from '../../ReusableComponents/UGradGradToggle';
import { ModeType } from "../../helpers/types";
import GlassBox from '../../containers/GlassBox';

interface MTControlPanelProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  mode: ModeType;
  onModeChange: () => void;
  //Some pages (e.g. FacultyDB) don't have distinct undergrad/grad modes.
  showModeToggle?: boolean;
}

const MAX_FILTERS = 5;

export const MTControlPanel = ({ pageSize, onPageSizeChange, mode, onModeChange, showModeToggle = true }: MTControlPanelProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [filters, setFilters] = useState<number[]>([]);

  return (
    <GlassBox
      w={{ base: "100%", lg: "200px" }}
      mx="auto"
      p={4}
      alignSelf="flex-start"
      position={{ base: "static", lg: "sticky" }}
      top={{ base: "auto", lg: "80px" }}
    >
      <Stack spacing={4}>
        <Box>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={isDark ? 'gray.400' : 'gray.500'}
            mb={2}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Items per page
          </Text>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            size="sm"
            borderRadius="lg"
            fontWeight="500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </Box>

        {showModeToggle && (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="600"
              color={isDark ? 'gray.400' : 'gray.500'}
              mb={2}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              View Mode
            </Text>
            <UGradGradToggle mode={mode} onToggle={onModeChange} />
          </Box>
        )}

        <Box>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={isDark ? 'gray.400' : 'gray.500'}
            mb={2}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Filters
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
      </Stack>
    </GlassBox>
  );
};
