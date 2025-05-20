import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Image } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData, UndergradContent, GradContent, Content} from './MasterTable'; // Adjust the path as necessary
import { ModeType } from './App';
// Define the props interface for MasterTableRow
interface MasterTableRowProps {
  item: UniversityData;
  mode: ModeType;
  toggleMode: () => void;
  onExpand: (id: number) => Promise<Content>;
}

const MasterTableRow: React.FC<MasterTableRowProps> = ({ item, mode, toggleMode, onExpand }) => {
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
        const content  = await onExpand(item.id);
        item.content = content;
        setIsExpanded(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
  <AccordionItem 
    _odd={{ bg: "rgba(255, 255, 255, 0.2)"}}  // Light grey for odd items
    _even={{ bg: 'white' }}    // White for even items
  >
    <AccordionButton 
    onClick={handleExpand}
    borderRadius="md" 
    _expanded={{ bg: mode === 'undergrad' ? "#00274c" : "green.800", color: 'white' }}
    >
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
    <MTExpandedEntry mode={mode} content={item.content} isLoading={isLoading} />
  </AccordionItem>
  )
};

export default MasterTableRow;
