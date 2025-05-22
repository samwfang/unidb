import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Image, Icon} from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData, UndergradContent, GradContent, Content} from './MasterTable'; // Adjust the path as necessary
import { ModeType } from './App';
import { FaUniversity } from 'react-icons/fa';

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
    _odd={{ bg: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(16px)" }}  // Light grey for odd items
    _even={{ bg: 'white' }}
    minH={{ base: "50px", md: "60px" }}   // White for even items
  >
    <AccordionButton 
    onClick={handleExpand}
    borderRadius="md" 
    _expanded={{ bg: mode === 'undergrad' ? "blue.800" : "green.800", color: 'white' }}
    minH={{ base: "50px", md: "60px" }}
    >
      <Grid templateColumns="50px 2fr 1fr 1fr 1fr" gap={4} w="full" alignItems="center">
        {/* Logo for University */}
        <GridItem textAlign="center">
          {item.icon ? (
            <Image
              src={`/logos/${item.icon}`}
              alt={`${item.name} logo`}
              boxSize="40px"
              objectFit="contain"
              fallback={<Icon as={FaUniversity as React.ComponentType} boxSize="20px" color={mode === 'undergrad' ? "blue.500" : "green.500"}/>} // Fallback icon if image fails
            />
          ) : (
            <Icon as={FaUniversity as React.ComponentType} boxSize="20px" color={mode === 'undergrad' ? "blue.500" : "green.500"} /> // Default icon if no icon is provided
          )}
        </GridItem>

        {/* University Name */}
        <GridItem textAlign="center">
          <Box flex="1" textAlign="left" fontWeight="bold">
            {item.name}
          </Box>
        </GridItem>

        {/* Other Columns */}
        <GridItem textAlign="center">{item.location}</GridItem>
        <GridItem textAlign="center">{item.content?.undergrad_content?.general_content.graduation_rate}</GridItem>
        <GridItem textAlign="center">{item.location}</GridItem>
      </Grid>
    </AccordionButton>

    {/* This is the Expanded Entry, what you see when the user clicks each entry in the table */}
    <MTExpandedEntry mode={mode} content={item.content} isLoading={isLoading} />
  </AccordionItem>
  )
};

export default MasterTableRow;
