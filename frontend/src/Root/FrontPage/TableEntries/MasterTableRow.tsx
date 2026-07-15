import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, useColorMode } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData, Content } from '../MasterTable';
import { ModeType } from "../../../helpers/types";
import { ColumnType, getColumnData } from '../../../helpers/DepartmentHelper';

interface MasterTableRowProps {
  rank: number;
  item: UniversityData;
  mode: ModeType;
  columnDepts: { value: string, label: string }[];
  columnTypes: ColumnType[];
  toggleMode: () => void;
  onExpand: (id: number) => Promise<Content>;
}

const MasterTableRow: React.FC<MasterTableRowProps> = ({ rank, item, mode, columnDepts, columnTypes, toggleMode, onExpand }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    if (isExpanded) {
      handleExpand();
    }
  }, [mode]);

  const handleExpand = async () => {
    if (!isExpanded) {
      setIsLoading(true);
      try {
        setIsExpanded(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const activeColor = mode === ModeType.Undergrad ? 'brand.500' : 'purple.500';

  return (
    <AccordionItem
      border="none"
      _notFirst={{ mt: '1px' }}
    >
      {({ isExpanded: isAccordionExpanded }) => (
        <>
          <AccordionButton
            onClick={handleExpand}
            borderRadius="lg"
            mx={1}
            my={0.5}
            px={{ base: 2, md: 3 }}
            py={{ base: 2, md: 2.5 }}
            minH={{ base: "44px", md: "52px" }}
            _hover={{
              bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            }}
            _expanded={{
              bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              boxShadow: 'inset 0 0 0 1px',
              insetBoxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.06)' : '0 0 0 1px rgba(0,0,0,0.06)',
            }}
            transition="all 0.15s ease"
          >
            <Grid
              templateColumns={{
                base: `30px minmax(120px, 1fr) ${'minmax(60px, 1fr) '.repeat(columnDepts.length)}`,
                md: "60px 2fr 1fr 1fr 1fr"
              }}
              gap={{ base: 2, md: 4 }}
              width="100%"
              alignItems="center"
            >
              {/* Rank */}
              <GridItem textAlign="center">
                <Box
                  fontWeight="600"
                  color={activeColor}
                  fontSize={{ base: "xs", md: "sm" }}
                  opacity={0.8}
                >
                  {rank}
                </Box>
              </GridItem>

              {/* University Name */}
              <GridItem textAlign="left">
                <Box
                  fontWeight="600"
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? 'gray.100' : 'gray.700'}
                  lineHeight="short"
                  noOfLines={1}
                >
                  {item.name}
                </Box>
              </GridItem>

              {/* Dynamic Columns */}
              {columnDepts.map((dept, index) => (
                <GridItem
                  key={index}
                  textAlign="center"
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? 'gray.300' : 'gray.600'}
                >
                  {getColumnData(item, columnTypes[index], mode, dept.value)}
                </GridItem>
              ))}
            </Grid>
          </AccordionButton>

          <MTExpandedEntry
            mode={mode}
            item={item}
            rank={rank}
            content={item.content}
            isLoading={isLoading}
            isExpanded={isAccordionExpanded}
          />
        </>
      )}
    </AccordionItem>
  );
};

export default MasterTableRow;
