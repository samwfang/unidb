import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Image } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData } from './MasterTable'; // Adjust the path as necessary
import { ModeType } from './App';
// Define the props interface for MasterTableRow
interface MasterTableRowProps {
  item: UniversityData;
  mode: ModeType;
  onExpand: (id: number, type: ModeType) => Promise<string>;
}

const MasterTableRow: React.FC<MasterTableRowProps> = ({ item, mode, onExpand }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  //Remove Content when Mode Change
  useEffect(() => {
    item.content = undefined;
    if (isExpanded) {
      handleExpand();
    }
  }, [mode]);

  const handleExpand = async () => {
    setIsExpanded(true);
    setIsLoading(true);
    item.content = await onExpand(item.id, mode);
    setIsLoading(false);
  };

  return (
  <AccordionItem>
    <AccordionButton onClick={handleExpand}>
      <Grid templateColumns="50px 1fr 1fr 1fr 1fr" gap={4} w="full" alignItems="center">
        {/* Logo for University */}
        <GridItem>
          <Image
            src={`/logos/${item.icon}`} // Adjust the path based on where you store your images
            alt={`${item.name} logo`}
            boxSize="40px"
            objectFit="contain"
          />
        </GridItem>

        {/* University Name */}
        <GridItem>
          <Box flex="1" textAlign="left">
            <b>{item.name}</b>
          </Box>
        </GridItem>

        {/* Other Columns */}
        <GridItem>{item.location}</GridItem>
        <GridItem>{item.studentFacultyRatio}</GridItem>
      </Grid>
    </AccordionButton>

    {/* This is the Expanded Entry, what you see when the user clicks each entry in the table */}
    <MTExpandedEntry content={item.content} isLoading={isLoading} />
  </AccordionItem>
  )
};

export default MasterTableRow;
