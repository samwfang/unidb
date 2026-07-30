import { Box, Stack, Text, Select, useColorMode } from '@chakra-ui/react';
import UGradGradToggle from '../../ReusableComponents/UGradGradToggle';
import { ModeType } from "../../helpers/types";
import GlassBox from '../../containers/GlassBox';

interface MTControlPanelProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  mode: ModeType;
  onModeChange: () => void;
}

export const MTControlPanel = ({ pageSize, onPageSizeChange, mode, onModeChange }: MTControlPanelProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

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
      </Stack>
    </GlassBox>
  );
};
