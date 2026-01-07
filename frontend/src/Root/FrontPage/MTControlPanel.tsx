import { Box, Stack, Text, Select } from '@chakra-ui/react';
import UGradGradToggle from '../../ReusableComponents/UGradGradToggle';
import { ModeType } from "../../helpers/types";
import GlassBox from '../../containers/GlassBox';

interface MTControlPanelProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  mode: ModeType;
  onModeChange: () => void;
}

/*
Displays the Control Panel on the Left of the Master Table, to allow for Filtering and Searching
*/
export const MTControlPanel = ({ pageSize, onPageSizeChange, mode, onModeChange }: MTControlPanelProps) => {
  return (
    <GlassBox 
      w={{ base: "100%", lg: "220px" }}
      mx="auto" mt="8"
      p={3}
    >
      <Stack spacing={4}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            Items per page
          </Text>
          <Select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            size="sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </Box>
        
        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            View Mode
          </Text>
          <Box>
            <UGradGradToggle mode={mode} onToggle={onModeChange} />
          </Box>
        </Box>
      </Stack>
    </GlassBox>
  );
};