import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Image, Icon } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData, UndergradContent, GradContent, Content } from './MasterTable'; // Adjust the path as necessary
import { ModeType } from './App';
import { FaUniversity } from 'react-icons/fa';
import { ColumnType, getColumnData } from './helpers/DepartmentHelper';

// Define the props interface for MasterTableRow
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

  //Remove Content when Mode Change
  useEffect(() => {
    if (isExpanded) {
      handleExpand();
    }
  }, [mode]);

  const handleExpand = async () => {
    if (!isExpanded) {
      setIsLoading(true);
      try {
        //const content  = await onExpand(item.id);
        //item.content = content;
        setIsExpanded(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AccordionItem
      _odd={{ bg: "rgba(255, 255, 255, 0.2)" }}  // Light grey for odd items
      _even={{ bg: "rgba(255, 255, 255, 0.4)" }}
      minH={{ base: "40px", md: "60px" }}   // White for even items
    >
      <AccordionButton
        onClick={handleExpand}
        borderRadius="lg"
        _expanded={{
          bg: mode === 'undergrad' ? "blue.500" : "gray.600", color: 'white',
          "& > div > div:first-of-type > div": {  // Targets the rank Box
            color: "white"
          }
        }}
        minH={{ base: "40px", md: "60px" }}
        py={{ base: 1, md: 2 }}
      >
        <Grid templateColumns={{
          base: `30px minmax(120px, 1fr) ${'minmax(60px, 1fr) '.repeat(columnDepts.length)}`,
          md: "75px 2fr 1fr 1fr 1fr"
        }}
          gap={{ base: 2, md: 4 }}
          w="full"
          alignItems="center">
          {/* Logo for University */}
          <GridItem textAlign="center">
            <Box
              fontWeight="bold"
              color={mode === 'undergrad' ? "blue.500" : "gray.600"}
              _expanded={{ color: "white" }}
              fontSize={{ base: "s", md: "lg" }}
            >
              {rank}
            </Box>
          </GridItem>

          {/* University Name */}
          <GridItem textAlign="center">
            <Box flex="1" textAlign="left" fontWeight="bold" fontSize={{ base: "xs", md: "md" }}>
              {item.name}
            </Box>
          </GridItem>

          {/* Dynamic Columns */}
          {columnDepts.map((dept, index) => (
            <GridItem key={index} textAlign="center" fontSize={{ base: "xs", md: "sm" }}>
              {getColumnData(item, columnTypes[index], mode, dept.value)}
            </GridItem>
          ))}
        </Grid>
      </AccordionButton>

      {/* This is the Expanded Entry, what you see when the user clicks each entry in the table */}

      <MTExpandedEntry mode={mode} item={item} rank={rank} content={item.content} isLoading={isLoading} isExpanded={isExpanded} />
    </AccordionItem>
  )
};

export default MasterTableRow;
